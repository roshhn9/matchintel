/* =========================================
   MATCHINTEL - LIVE SYNC + AUTO RESULT ENGINE
   STEP 27D-2C-5
========================================= */

(function () {
    "use strict";

    const API_BASE = "https://matchintel.onrender.com";
    const REFRESH_MS = 2 * 60 * 1000;
    const STORAGE_KEY = "matchintel:auto-results:v1";

    function formatKickoffForIndia(utcDate) {
        if (!utcDate) return null;
        const date = new Date(utcDate);
        if (Number.isNaN(date.getTime())) return null;

        return {
            date: new Intl.DateTimeFormat("en-IN", {
                timeZone: "Asia/Kolkata",
                day: "numeric",
                month: "long",
                year: "numeric"
            }).format(date),

            time: new Intl.DateTimeFormat("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "numeric",
                minute: "2-digit",
                hour12: true
            }).format(date) + " IST"
        };
    }

    function normalizeStatus(status) {
        return ({
            SCHEDULED: "upcoming",
            TIMED: "upcoming",
            POSTPONED: "postponed",
            SUSPENDED: "suspended",
            CANCELLED: "cancelled",
            IN_PLAY: "live",
            PAUSED: "live",
            FINISHED: "finished"
        })[status] || String(status || "upcoming").toLowerCase();
    }

    function getScore(apiMatch) {
        const full = apiMatch?.score?.fullTime || {};
        const regular = apiMatch?.score?.regularTime || {};

        const home = full.home ?? regular.home ?? null;
        const away = full.away ?? regular.away ?? null;

        if (home === null || away === null) return null;

        return { home, away, text: home + "-" + away };
    }

    function getQualifiedTeam(prediction, apiMatch) {
        const winner = apiMatch?.score?.winner;

        if (winner === "HOME_TEAM") return prediction.homeTeam;
        if (winner === "AWAY_TEAM") return prediction.awayTeam;

        return null;
    }

    function gradePrediction(prediction, apiMatch) {
        if (apiMatch.status !== "FINISHED") return null;

        const qualifiedTeam = getQualifiedTeam(prediction, apiMatch);
        const text = String(prediction.prediction || "").trim();
        const qualifyMatch = text.match(/^(.*?)\s+to\s+qualify$/i);

        if (!qualifyMatch || !qualifiedTeam) return null;

        const predictedTeam = qualifyMatch[1].trim();
        const correct =
            predictedTeam.toLowerCase() === qualifiedTeam.toLowerCase();

        return {
            result: correct ? "won" : "lost",
            correct,
            actualResult: qualifiedTeam + " Qualified"
        };
    }

    function buildCompletedPrediction(prediction, apiMatch, grade) {
        return {
            id: prediction.id,
            apiMatchId: prediction.apiMatchId,
            competition: prediction.competition,
            date: prediction.date,
            homeTeam: prediction.homeTeam,
            homeFlag: prediction.homeFlag,
            homeFlagUrl: prediction.homeFlagUrl,
            awayTeam: prediction.awayTeam,
            awayFlag: prediction.awayFlag,
            awayFlagUrl: prediction.awayFlagUrl,
            prediction: prediction.prediction,
            confidence: prediction.confidence,
            expectedScore: prediction.expectedScore,
            actualScore: prediction.actualScore,
            actualResult: grade.actualResult,
            result: grade.result,
            correct: grade.correct,
            apiWinner: apiMatch?.score?.winner || null,
            autoGraded: true
        };
    }

    function saveAutoResults() {
        try {
            const autoResults = completedPredictions.filter(
                item => item.autoGraded === true
            );
            localStorage.setItem(STORAGE_KEY, JSON.stringify(autoResults));
        } catch (error) {
            console.warn("[MatchIntel Auto Results] Save failed:", error);
        }
    }

    function restoreAutoResults() {
        if (typeof completedPredictions === "undefined") return;

        try {
            const saved = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );

            if (!Array.isArray(saved)) return;

            saved.forEach(savedResult => {
                const index = completedPredictions.findIndex(
                    item => Number(item.id) === Number(savedResult.id)
                );

                if (index === -1) {
                    completedPredictions.push(savedResult);
                } else if (completedPredictions[index].autoGraded === true) {
                    completedPredictions[index] = savedResult;
                }
            });
        } catch (error) {
            console.warn("[MatchIntel Auto Results] Restore failed:", error);
        }
    }

    function addOrUpdateCompletedPrediction(completedMatch) {
        if (typeof completedPredictions === "undefined") return;

        const index = completedPredictions.findIndex(
            item => Number(item.id) === Number(completedMatch.id)
        );

        if (index === -1) {
            completedPredictions.push(completedMatch);
        } else if (completedPredictions[index].autoGraded === true) {
            completedPredictions[index] = completedMatch;
        }

        saveAutoResults();
    }

    function applyApiMatch(prediction, apiMatch) {
        prediction.liveDataConnected = true;
        prediction.apiStatus = apiMatch.status;
        prediction.status = normalizeStatus(apiMatch.status);
        prediction.apiLastUpdated = apiMatch.lastUpdated || null;

        const kickoff = formatKickoffForIndia(apiMatch.utcDate);
        if (kickoff) {
            prediction.date = kickoff.date;
            prediction.time = kickoff.time;
        }

        if (apiMatch.homeTeam?.crest) {
            prediction.homeFlagUrl = apiMatch.homeTeam.crest;
        }

        if (apiMatch.awayTeam?.crest) {
            prediction.awayFlagUrl = apiMatch.awayTeam.crest;
        }

        const score = getScore(apiMatch);

        if (score) {
            prediction.liveHomeScore = score.home;
            prediction.liveAwayScore = score.away;
            prediction.actualScore = score.text;
        }

        if (apiMatch.status === "FINISHED") {
            prediction.finished = true;
            prediction.apiWinner = apiMatch.score?.winner || null;

            const grade = gradePrediction(prediction, apiMatch);

            if (grade) {
                prediction.result = grade.result;
                prediction.correct = grade.correct;
                prediction.actualResult = grade.actualResult;
                prediction.resultReadyForGrading = false;

                addOrUpdateCompletedPrediction(
                    buildCompletedPrediction(prediction, apiMatch, grade)
                );
            } else {
                prediction.resultReadyForGrading = true;
            }
        }
    }

async function fetchOneMatchById(matchId) {
    const response = await fetch(
        API_BASE + "/api/matches/" + matchId,
        {
            cache: "no-store"
        }
    );

    if (!response.ok) {
        throw new Error(
            "Could not fetch match ID " + matchId
        );
    }

    const data = await response.json();

    return data.match || null;
}

    async function fetchLiveMatches() {
        const response = await fetch(API_BASE + "/api/matches", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(
                "MatchIntel backend returned " + response.status
            );
        }

        return response.json();
    }

    async function syncPredictions() {
        if (typeof predictions === "undefined") {
            return { ok: false, synced: 0 };
        }

        const linked = predictions.filter(match => Boolean(match.apiMatchId));

        if (linked.length === 0) {
            return { ok: true, synced: 0, totalLinked: 0 };
        }

        const data = await fetchLiveMatches();
        const apiMatches = Array.isArray(data.matches) ? data.matches : [];

        const map = new Map(
            apiMatches.map(match => [Number(match.id), match])
        );

        let synced = 0;
        let autoGraded = 0;

        for (const prediction of linked) {

            let apiMatch =
                map.get(
                    Number(prediction.apiMatchId)
                );

            /*
               Default /matches response mein old finished
               match na mile, toh direct match ID se fetch karo.
            */

            if (!apiMatch) {

                console.log(
                    "[MatchIntel Live Sync] Fetching missing match directly:",
                    prediction.apiMatchId
                );

                try {

                    apiMatch =
                        await fetchOneMatchById(
                            prediction.apiMatchId
                        );

                } catch (error) {

                    console.warn(
                        "[MatchIntel Live Sync] Direct fetch failed:",
                        prediction.apiMatchId,
                        error.message
                    );

                    continue;
                }
            }

            if (!apiMatch) {
                continue;
            }

            const wasAutoGraded =
                prediction.result === "won" ||
                prediction.result === "lost";

            applyApiMatch(
                prediction,
                apiMatch
            );

            const isAutoGraded =
                prediction.result === "won" ||
                prediction.result === "lost";

            if (
                !wasAutoGraded &&
                isAutoGraded
            ) {
                autoGraded += 1;
            }

            synced += 1;
        }

        const detail = {
            ok: true,
            synced,
            totalLinked: linked.length,
            autoGraded,
            source: data.source || "backend",
            syncedAt: new Date().toISOString()
        };

        window.dispatchEvent(
            new CustomEvent("matchintel:live-data-ready", { detail })
        );

        console.log("[MatchIntel Live Sync]", detail);

        return detail;
    }

    async function safeSync() {
        try {
            return await syncPredictions();
        } catch (error) {
            console.error("[MatchIntel Live Sync Error]", error);

            const detail = {
                ok: false,
                synced: 0,
                error: error.message
            };

            window.dispatchEvent(
                new CustomEvent("matchintel:live-data-error", { detail })
            );

            return detail;
        }
    }

    restoreAutoResults();

    /*
       STEP 27D-2C-8C
       - Run first sync immediately
       - Refresh automatically every 2 minutes
       - Re-sync when the tab becomes active again
       - Prevent duplicate refresh timers
    */

    const initialSyncPromise = safeSync();

    let autoRefreshTimer = null;

    function startAutoRefresh(milliseconds) {

        const delay =
            Number(milliseconds) ||
            REFRESH_MS;

        if (autoRefreshTimer) {
            clearInterval(autoRefreshTimer);
        }

        autoRefreshTimer =
            setInterval(
                safeSync,
                delay
            );

        return autoRefreshTimer;
    }

    function stopAutoRefresh() {

        if (!autoRefreshTimer) {
            return;
        }

        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
    }

    document.addEventListener(
        "visibilitychange",
        function () {

            if (
                document.visibilityState ===
                "visible"
            ) {
                safeSync();
            }

        }
    );

    window.addEventListener(
        "focus",
        function () {
            safeSync();
        }
    );

    window.MatchIntelLiveSync = {
        sync: safeSync,
        ready: initialSyncPromise,
        refreshEvery: startAutoRefresh,
        stopRefresh: stopAutoRefresh
    };

    startAutoRefresh(REFRESH_MS);

})();
