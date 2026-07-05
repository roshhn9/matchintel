/* =========================================
   MATCHINTEL - COMPLETE MAIN JAVASCRIPT

   FEATURES:
   - Mobile Navigation
   - Homepage Predictions
   - Predictions Page
   - Prediction Filters
   - Homepage Performance Stats
   - Latest Analysis
   - Results Page
   - Results Summary
   - Results Filters
   - Complete Statistics Page
========================================= */


/* =========================================
   MOBILE NAVIGATION MENU
========================================= */

const menuBtn = document.getElementById("menuBtn");

const navLinks = document.getElementById("navLinks");


if (menuBtn && navLinks) {

    menuBtn.addEventListener("click", function () {

        navLinks.classList.toggle("show");


        if (navLinks.classList.contains("show")) {

            menuBtn.textContent = "✕";

            menuBtn.setAttribute(
                "aria-label",
                "Close navigation menu"
            );

        } else {

            menuBtn.textContent = "☰";

            menuBtn.setAttribute(
                "aria-label",
                "Open navigation menu"
            );

        }

    });


    const navigationLinks =
        navLinks.querySelectorAll("a");


    navigationLinks.forEach(function (link) {

        link.addEventListener("click", function () {

            navLinks.classList.remove("show");

            menuBtn.textContent = "☰";

            menuBtn.setAttribute(
                "aria-label",
                "Open navigation menu"
            );

        });

    });

}



/* =========================================
   HELPER FUNCTION
   CALCULATE PERCENTAGE
========================================= */

function calculatePercentage(correct, total) {

    if (total === 0) {

        return 0;

    }


    return Number(
        ((correct / total) * 100).toFixed(1)
    );

}



/* =========================================
   HELPER FUNCTION
   FORMAT PERCENTAGE
========================================= */

function formatPercentage(number) {

    if (Number.isInteger(number)) {

        return number + "%";

    }


    return number.toFixed(1) + "%";

}




/* =========================================
   STEP 20
   DYNAMIC MATCH ANALYSIS URL
========================================= */

function getAnalysisPageUrl(match) {

    const currentPath =
        window.location.pathname;

    const isInsideMatchesFolder =
        currentPath.includes("/matches/");

    const basePath =
        isInsideMatchesFolder
            ? "match-analysis.html"
            : "matches/match-analysis.html";

    return (
        basePath +
        "?id=" +
        encodeURIComponent(match.id)
    );

}



/* =========================================
   STEP 27D-2E-2B
   DYNAMIC FINISHED MATCH RESULT URL
========================================= */

function getResultPageUrl(result) {

    const currentPath =
        window.location.pathname;

    const isInsideMatchesFolder =
        currentPath.includes("/matches/");

    const basePath =
        isInsideMatchesFolder
            ? "match-result.html"
            : "matches/match-result.html";

    const resultId =
        result.apiMatchId ||
        result.id;

    return (
        basePath +
        "?id=" +
        encodeURIComponent(resultId)
    );

}


/* =========================================
   STEP 27D-2C-8A
   LIVE MATCH STATE UI HELPERS
========================================= */

function getMatchLiveState(match) {

    const status = String(
        match.apiStatus || match.status || ""
    ).toUpperCase();

    const hasScore =
        match.liveHomeScore !== null &&
        match.liveHomeScore !== undefined &&
        match.liveAwayScore !== null &&
        match.liveAwayScore !== undefined;

    const scoreText = hasScore
        ? `${match.liveHomeScore}-${match.liveAwayScore}`
        : "";

    if (status === "IN_PLAY") {
        return {
            className: "is-live",
            label: "🔴 LIVE",
            scoreText
        };
    }

    if (status === "PAUSED") {
        return {
            className: "is-paused",
            label: "HALF TIME",
            scoreText
        };
    }

    if (status === "FINISHED") {
        return {
            className: "is-finished",
            label: "FT",
            scoreText:
                scoreText ||
                match.actualScore ||
                ""
        };
    }

    return {
        className: "is-upcoming",
        label: "",
        scoreText: ""
    };
}


function renderMatchCenter(match, showKickoffTime) {

    const liveState =
        getMatchLiveState(match);

    if (liveState.label) {
        return `
            <div class="match-live-center ${liveState.className}">
                <span class="match-live-label">
                    ${liveState.label}
                </span>

                ${
                    liveState.scoreText
                        ? `
                            <strong class="match-live-score">
                                ${liveState.scoreText}
                            </strong>
                        `
                        : ""
                }
            </div>
        `;
    }

    return `
        <div>
            VS
        </div>

        ${
            showKickoffTime
                ? `
                    <small class="match-time">
                        ${match.time || ""}
                    </small>
                `
                : ""
        }
    `;
}


/* =========================================
   CREATE HOMEPAGE PREDICTION CARD
========================================= */

function createPredictionCard(match) {

    return `

        <article class="prediction-card">

            <div class="card-top">

                <span class="competition">
                    ${match.competition}
                </span>

                <span class="match-date">
                    ${match.date}
                </span>

            </div>


            <div class="teams">

                <div class="team">

                    <div class="team-badge">
                        ${renderMatchIntelFlag(match.homeTeam, match.homeFlagUrl, match.homeFlag)}
                    </div>

                    <div class="team-name">
                        ${match.homeTeam}
                    </div>

                </div>


                <div class="vs">
                    ${renderMatchCenter(match, false)}
                </div>


                <div class="team">

                    <div class="team-badge">
                        ${renderMatchIntelFlag(match.awayTeam, match.awayFlagUrl, match.awayFlag)}
                    </div>

                    <div class="team-name">
                        ${match.awayTeam}
                    </div>

                </div>

            </div>


            <div class="prediction-info">

                <span class="prediction-label">
                    Main Prediction
                </span>

                <div class="prediction-pick">
                    ${match.prediction}
                </div>


                <div class="confidence-row">

                    <div class="confidence-info">

                        <span>
                            Confidence
                        </span>

                        <strong>
                            ${match.confidence}%
                        </strong>

                    </div>


                    <div class="confidence-bar">

                        <div
                            class="confidence-fill"
                            style="width: ${match.confidence}%"
                        >
                        </div>

                    </div>

                </div>


                <a
                    href="${getAnalysisPageUrl(match)}"
                    class="analysis-link"
                >

                    Full Match Analysis →

                </a>

            </div>

        </article>

    `;

}



/* =========================================
   CREATE FULL PREDICTION PAGE CARD
========================================= */

function createFullPredictionCard(match) {

    return `

        <article class="prediction-card">

            <div class="card-top">

                <span class="competition">
                    ${match.competition}
                </span>

                <span class="match-date">
                    ${match.date}
                </span>

            </div>


            <div class="teams">

                <div class="team">

                    <div class="team-badge">
                        ${renderMatchIntelFlag(match.homeTeam, match.homeFlagUrl, match.homeFlag)}
                    </div>

                    <div class="team-name">
                        ${match.homeTeam}
                    </div>

                </div>


                <div class="vs">
                    ${renderMatchCenter(match, true)}
                </div>


                <div class="team">

                    <div class="team-badge">
                        ${renderMatchIntelFlag(match.awayTeam, match.awayFlagUrl, match.awayFlag)}
                    </div>

                    <div class="team-name">
                        ${match.awayTeam}
                    </div>

                </div>

            </div>


            <div class="prediction-info">

                <span class="prediction-label">
                    Main Prediction
                </span>

                <div class="prediction-pick">
                    ${match.prediction}
                </div>


                <div class="probability-box">

                    <div class="probability-item">

                        <span>
                            ${match.homeTeam}
                        </span>

                        <strong>
                            ${match.homeWin}%
                        </strong>

                    </div>


                    <div class="probability-item">

                        <span>
                            Draw
                        </span>

                        <strong>
                            ${match.draw}%
                        </strong>

                    </div>


                    <div class="probability-item">

                        <span>
                            ${match.awayTeam}
                        </span>

                        <strong>
                            ${match.awayWin}%
                        </strong>

                    </div>

                </div>


                <div class="extra-predictions">

                    <div class="extra-prediction">

                        <span>
                            Over 2.5
                        </span>

                        <strong>
                            ${match.over25}%
                        </strong>

                    </div>


                    <div class="extra-prediction">

                        <span>
                            BTTS
                        </span>

                        <strong>
                            ${match.btts}%
                        </strong>

                    </div>


                    <div class="extra-prediction">

                        <span>
                            Expected Score
                        </span>

                        <strong>
                            ${match.expectedScore}
                        </strong>

                    </div>

                </div>


                <div class="confidence-row">

                    <div class="confidence-info">

                        <span>
                            Confidence
                        </span>

                        <strong>
                            ${match.confidence}%
                        </strong>

                    </div>


                    <div class="confidence-bar">

                        <div
                            class="confidence-fill"
                            style="width: ${match.confidence}%"
                        >
                        </div>

                    </div>

                </div>


                <a
                    href="${getAnalysisPageUrl(match)}"
                    class="analysis-link"
                >

                    Read Full Match Analysis →

                </a>

            </div>

        </article>

    `;

}



/* =========================================
   STEP 27D-2E-1
   LATEST MATCHES FIRST

   Priority:
   1. LIVE / HALF TIME
   2. Today's upcoming matches
   3. Next upcoming matches
   4. Recently finished matches
========================================= */

function getMatchSortTime(match) {

    if (match.utcDate) {
        const utcTime = new Date(match.utcDate).getTime();

        if (!Number.isNaN(utcTime)) {
            return utcTime;
        }
    }

    if (match.date) {
        const dateTime = new Date(match.date).getTime();

        if (!Number.isNaN(dateTime)) {
            return dateTime;
        }
    }

    return Number.MAX_SAFE_INTEGER;
}


function getLatestMatchesFirst() {

    if (
        typeof predictions === "undefined" ||
        !Array.isArray(predictions)
    ) {
        return [];
    }

    const now = Date.now();

    return predictions
        .map(function (match, index) {

            const status = String(
                match.apiStatus ||
                match.status ||
                ""
            ).toUpperCase();

            const matchTime =
                getMatchSortTime(match);

            let priority = 3;

            if (
                status === "IN_PLAY" ||
                status === "PAUSED"
            ) {
                priority = 0;
            }

            else if (
                status !== "FINISHED" &&
                status !== "CANCELLED" &&
                status !== "POSTPONED" &&
                matchTime >= now
            ) {
                priority = 1;
            }

            else if (
                status === "FINISHED"
            ) {
                priority = 2;
            }

            return {
                match,
                index,
                priority,
                matchTime
            };
        })
        .sort(function (a, b) {

            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }

            /*
               Upcoming: nearest match first.
               Finished: most recently finished first.
            */

            if (a.priority === 2) {
                return b.matchTime - a.matchTime;
            }

            if (a.matchTime !== b.matchTime) {
                return a.matchTime - b.matchTime;
            }

            return a.index - b.index;
        })
        .map(function (item) {
            return item.match;
        });
}


/* =========================================
   DISPLAY HOMEPAGE TOP PREDICTIONS
========================================= */

function displayTopPredictions() {

    const predictionGrid =
        document.getElementById("predictionGrid");


    if (!predictionGrid) {

        return;

    }


    if (
        typeof predictions === "undefined" ||
        predictions.length === 0
    ) {

        predictionGrid.innerHTML = `

            <div class="empty-message">

                No predictions available right now.

            </div>

        `;


        return;

    }


    const topPredictions =
        getLatestMatchesFirst()
            .slice(0, 3);


    predictionGrid.innerHTML =
        topPredictions
            .map(createPredictionCard)
            .join("");

}



/* =========================================
   DISPLAY ALL PREDICTIONS
========================================= */

function displayAllPredictions(matchesToShow) {

    const allPredictionsGrid =
        document.getElementById(
            "allPredictionsGrid"
        );


    if (!allPredictionsGrid) {

        return;

    }


    if (
        !matchesToShow ||
        matchesToShow.length === 0
    ) {

        allPredictionsGrid.innerHTML = `

            <div class="empty-message">

                No matches found for this filter.

            </div>

        `;


        return;

    }


    allPredictionsGrid.innerHTML =
        matchesToShow
            .map(createFullPredictionCard)
            .join("");

}



/* =========================================
   PREDICTION FILTER SYSTEM
========================================= */

function setupPredictionFilters() {

    const filterButtons =
        document.querySelectorAll(".filter-btn");


    const allPredictionsGrid =
        document.getElementById(
            "allPredictionsGrid"
        );


    if (
        filterButtons.length === 0 ||
        !allPredictionsGrid
    ) {

        return;

    }


    filterButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                filterButtons.forEach(
                    function (btn) {

                        btn.classList.remove("active");

                    }
                );


                button.classList.add("active");


                const selectedFilter =
                    button.dataset.filter;


                let filteredMatches = [];


                if (selectedFilter === "all") {

                    filteredMatches =
                        predictions;

                }


                else if (
                    selectedFilter === "high"
                ) {

                    filteredMatches =
                        predictions.filter(
                            function (match) {

                                return (
                                    match.confidence >= 70
                                );

                            }
                        );

                }


                else if (
                    selectedFilter === "goals"
                ) {

                    filteredMatches =
                        predictions.filter(
                            function (match) {

                                return (
                                    match.over25 >= 55
                                );

                            }
                        );

                }


                else if (
                    selectedFilter === "btts"
                ) {

                    filteredMatches =
                        predictions.filter(
                            function (match) {

                                return (
                                    match.btts >= 55
                                );

                            }
                        );

                }


                displayAllPredictions(
                    filteredMatches
                );

            }
        );

    });

}



/* =========================================
   HOMEPAGE PERFORMANCE STATISTICS
========================================= */

function displayPerformanceStats() {

    const totalElement =
        document.getElementById(
            "totalPredictions"
        );


    const correctElement =
        document.getElementById(
            "correctPredictions"
        );


    const accuracyElement =
        document.getElementById(
            "accuracyRate"
        );


    if (
        !totalElement ||
        !correctElement ||
        !accuracyElement
    ) {

        return;

    }


    if (
        typeof completedPredictions ===
            "undefined" ||
        completedPredictions.length === 0
    ) {

        totalElement.textContent = "0";

        correctElement.textContent = "0";

        accuracyElement.textContent = "0%";


        return;

    }


    const total =
        completedPredictions.length;


    const correct =
        completedPredictions.filter(
            function (prediction) {

                return (
                    prediction.correct === true
                );

            }
        ).length;


    const accuracy =
        calculatePercentage(
            correct,
            total
        );


    totalElement.textContent =
        total;


    correctElement.textContent =
        correct;


    accuracyElement.textContent =
        formatPercentage(accuracy);

}



/* =========================================
   LATEST ANALYSIS SECTION
========================================= */

function displayLatestAnalysis() {

    const analysisGrid =
        document.getElementById(
            "analysisGrid"
        );


    if (!analysisGrid) {

        return;

    }


    if (
        typeof predictions === "undefined" ||
        predictions.length === 0
    ) {

        analysisGrid.innerHTML = `

            <div class="empty-message">

                Match analysis coming soon.

            </div>

        `;


        return;

    }


    const latestMatches =
        getLatestMatchesFirst()
            .slice(0, 3);


    analysisGrid.innerHTML =
        latestMatches
            .map(function (match) {

                return `

                    <article class="prediction-card">

                        <div class="card-top">

                            <span class="competition">
                                ${match.competition}
                            </span>

                            <span class="match-date">
                                ${match.date}
                            </span>

                        </div>


                        <div class="analysis-match-title">

                            <span class="analysis-flag">
                                ${renderMatchIntelFlag(match.homeTeam, match.homeFlagUrl, match.homeFlag)}
                            </span>


                            <h3>

                                ${match.homeTeam}
                                vs
                                ${match.awayTeam}

                            </h3>


                            <span class="analysis-flag">
                                ${renderMatchIntelFlag(match.awayTeam, match.awayFlagUrl, match.awayFlag)}
                            </span>

                        </div>


                        <p class="analysis-description">

                            Full match analysis including
                            win probabilities, expected score,
                            goal predictions and key factors.

                        </p>


                        <div class="prediction-info">

                            <span class="prediction-label">
                                Expected Score
                            </span>


                            <div class="prediction-pick">
                                ${match.expectedScore}
                            </div>


                            <a
                                href="${getAnalysisPageUrl(match)}"
                                class="analysis-link"
                            >

                                Read Full Analysis →

                            </a>

                        </div>

                    </article>

                `;

            })
            .join("");

}



/* =========================================
   CREATE RESULT CARD
========================================= */

function createResultCard(result) {

    const resultClass =
        result.correct
            ? "result-correct"
            : "result-incorrect";


    const badgeClass =
        result.correct
            ? "correct-badge"
            : "incorrect-badge";


    const badgeText =
        result.correct
            ? "✓ CORRECT"
            : "✕ INCORRECT";


    return `

        <article class="result-card ${resultClass}">


            <div class="result-card-top">

                <div>

                    <span class="competition">
                        ${result.competition}
                    </span>

                    <span class="result-date">
                        ${result.date}
                    </span>

                </div>


                <span
                    class="result-status-badge ${badgeClass}"
                >

                    ${badgeText}

                </span>

            </div>



            <div class="result-match">


                <div class="result-team">

                    <div class="result-team-flag">
                        ${renderMatchIntelFlag(result.homeTeam, result.homeFlagUrl, result.homeFlag)}
                    </div>

                    <span>
                        ${result.homeTeam}
                    </span>

                </div>



                <div class="actual-score-box">

                    <span class="score-label">
                        FINAL SCORE
                    </span>

                    <strong class="actual-score">
                        ${result.actualScore}
                    </strong>

                </div>



                <div class="result-team">

                    <div class="result-team-flag">
                        ${renderMatchIntelFlag(result.awayTeam, result.awayFlagUrl, result.awayFlag)}
                    </div>

                    <span>
                        ${result.awayTeam}
                    </span>

                </div>


            </div>



            <div class="result-details-grid">


                <div class="result-detail">

                    <span>
                        Our Prediction
                    </span>

                    <strong>
                        ${result.prediction}
                    </strong>

                </div>



                <div class="result-detail">

                    <span>
                        Confidence
                    </span>

                    <strong>
                        ${result.confidence}%
                    </strong>

                </div>



                <div class="result-detail">

                    <span>
                        Expected Score
                    </span>

                    <strong>
                        ${result.expectedScore}
                    </strong>

                </div>



                <div class="result-detail">

                    <span>
                        Actual Result
                    </span>

                    <strong>
                        ${result.actualResult}
                    </strong>

                </div>


            </div>


            <a
                href="${getResultPageUrl(result)}"
                class="analysis-link result-details-link"
            >
                View Full Match Details →
            </a>


        </article>

    `;

}



/* =========================================
   DISPLAY RESULTS LIST
========================================= */

function displayResults(resultsToShow) {

    const resultsList =
        document.getElementById(
            "resultsList"
        );


    if (!resultsList) {

        return;

    }


    if (
        !resultsToShow ||
        resultsToShow.length === 0
    ) {

        resultsList.innerHTML = `

            <div class="empty-message">

                No prediction results found.

            </div>

        `;


        return;

    }


    resultsList.innerHTML =
        resultsToShow
            .map(createResultCard)
            .join("");

}



/* =========================================
   RESULTS PAGE SUMMARY
========================================= */

function displayResultsSummary() {

    const totalElement =
        document.getElementById(
            "resultsTotal"
        );


    const correctElement =
        document.getElementById(
            "resultsCorrect"
        );


    const incorrectElement =
        document.getElementById(
            "resultsIncorrect"
        );


    const accuracyElement =
        document.getElementById(
            "resultsAccuracy"
        );


    if (
        !totalElement ||
        !correctElement ||
        !incorrectElement ||
        !accuracyElement
    ) {

        return;

    }


    if (
        typeof completedPredictions ===
            "undefined" ||
        completedPredictions.length === 0
    ) {

        totalElement.textContent = "0";

        correctElement.textContent = "0";

        incorrectElement.textContent = "0";

        accuracyElement.textContent = "0%";


        return;

    }


    const total =
        completedPredictions.length;


    const correct =
        completedPredictions.filter(
            function (result) {

                return (
                    result.correct === true
                );

            }
        ).length;


    const incorrect =
        total - correct;


    const accuracy =
        calculatePercentage(
            correct,
            total
        );


    totalElement.textContent =
        total;


    correctElement.textContent =
        correct;


    incorrectElement.textContent =
        incorrect;


    accuracyElement.textContent =
        formatPercentage(accuracy);

}



/* =========================================
   RESULTS FILTER SYSTEM
========================================= */

let activeResultFilter = "all";

function getCompletedResults() {

    if (
        typeof completedPredictions === "undefined" ||
        !Array.isArray(completedPredictions)
    ) {
        return [];
    }

    return completedPredictions
        .map(function (result, index) {

            let resultTime = 0;

            if (result.utcDate) {
                const utcTime =
                    new Date(result.utcDate).getTime();

                if (!Number.isNaN(utcTime)) {
                    resultTime = utcTime;
                }
            }

            if (!resultTime && result.date) {
                const dateTime =
                    new Date(result.date).getTime();

                if (!Number.isNaN(dateTime)) {
                    resultTime = dateTime;
                }
            }

            return {
                result,
                index,
                resultTime
            };
        })
        .sort(function (a, b) {

            if (a.resultTime !== b.resultTime) {
                return b.resultTime - a.resultTime;
            }

            return b.index - a.index;
        })
        .map(function (item) {
            return item.result;
        });
}


function renderActiveResultsFilter() {

    const allResults = getCompletedResults();

    let filteredResults = allResults;

    if (activeResultFilter === "correct") {

        filteredResults = allResults.filter(
            function (result) {
                return result.correct === true;
            }
        );

    } else if (activeResultFilter === "incorrect") {

        filteredResults = allResults.filter(
            function (result) {
                return result.correct === false;
            }
        );

    }

    displayResults(filteredResults);

}


function setupResultFilters() {

    const resultFilterButtons =
        document.querySelectorAll(
            ".result-filter-btn"
        );

    const resultsList =
        document.getElementById(
            "resultsList"
        );

    if (
        resultFilterButtons.length === 0 ||
        !resultsList
    ) {
        return;
    }

    resultFilterButtons.forEach(
        function (button) {

            if (button.dataset.matchintelBound === "true") {
                return;
            }

            button.dataset.matchintelBound = "true";

            button.addEventListener(
                "click",
                function () {

                    resultFilterButtons.forEach(
                        function (btn) {
                            btn.classList.remove("active");
                        }
                    );

                    button.classList.add("active");

                    activeResultFilter =
                        button.dataset.resultFilter || "all";

                    renderActiveResultsFilter();

                }
            );

        }
    );

}



/* =========================================
   STATS PAGE
   GET CONFIDENCE GROUP DATA
========================================= */

function getConfidenceGroup(
    minimum,
    maximum = Infinity
) {

    if (
        typeof completedPredictions ===
            "undefined"
    ) {

        return {

            total: 0,

            correct: 0,

            accuracy: 0

        };

    }


    const group =
        completedPredictions.filter(
            function (prediction) {

                return (
                    prediction.confidence >= minimum &&
                    prediction.confidence <= maximum
                );

            }
        );


    const total =
        group.length;


    const correct =
        group.filter(
            function (prediction) {

                return (
                    prediction.correct === true
                );

            }
        ).length;


    const accuracy =
        calculatePercentage(
            correct,
            total
        );


    return {

        total: total,

        correct: correct,

        accuracy: accuracy

    };

}



/* =========================================
   STATS PAGE
   UPDATE CONFIDENCE CARD
========================================= */

function updateConfidenceCard(
    prefix,
    data
) {

    const accuracyElement =
        document.getElementById(
            prefix + "ConfidenceAccuracy"
        );


    const totalElement =
        document.getElementById(
            prefix + "ConfidenceTotal"
        );


    const correctElement =
        document.getElementById(
            prefix + "ConfidenceCorrect"
        );


    const barElement =
        document.getElementById(
            prefix + "ConfidenceBar"
        );


    if (accuracyElement) {

        accuracyElement.textContent =
            formatPercentage(
                data.accuracy
            );

    }


    if (totalElement) {

        totalElement.textContent =
            data.total;

    }


    if (correctElement) {

        correctElement.textContent =
            data.correct;

    }


    if (barElement) {

        barElement.style.width =
            data.accuracy + "%";

    }

}



/* =========================================
   STATS PAGE
   DISPLAY RECENT FORM
========================================= */

function displayRecentForm() {

    const recentFormResults =
        document.getElementById(
            "recentFormResults"
        );


    const recentFormAccuracy =
        document.getElementById(
            "recentFormAccuracy"
        );


    const quickRecentForm =
        document.getElementById(
            "statsRecentForm"
        );


    if (
        typeof completedPredictions ===
            "undefined" ||
        completedPredictions.length === 0
    ) {

        if (recentFormResults) {

            recentFormResults.innerHTML = `

                <span class="form-result-empty">

                    No completed predictions yet.

                </span>

            `;

        }


        if (recentFormAccuracy) {

            recentFormAccuracy.textContent =
                "0%";

        }


        if (quickRecentForm) {

            quickRecentForm.textContent =
                "-";

        }


        return;

    }


    const recentPredictions =
        completedPredictions.slice(0, 6);


    const recentCorrect =
        recentPredictions.filter(
            function (prediction) {

                return (
                    prediction.correct === true
                );

            }
        ).length;


    const recentAccuracy =
        calculatePercentage(
            recentCorrect,
            recentPredictions.length
        );


    const formLetters =
        recentPredictions.map(
            function (prediction) {

                return (
                    prediction.correct
                        ? "W"
                        : "L"
                );

            }
        );


    if (recentFormResults) {

        recentFormResults.innerHTML =
            recentPredictions
                .map(
                    function (prediction) {

                        const resultClass =
                            prediction.correct
                                ? "form-win"
                                : "form-loss";


                        const resultLetter =
                            prediction.correct
                                ? "W"
                                : "L";


                        return `

                            <span
                                class="form-result ${resultClass}"
                                title="${prediction.homeTeam} vs ${prediction.awayTeam}"
                            >

                                ${resultLetter}

                            </span>

                        `;

                    }
                )
                .join("");

    }


    if (recentFormAccuracy) {

        recentFormAccuracy.textContent =
            formatPercentage(
                recentAccuracy
            );

    }


    if (quickRecentForm) {

        quickRecentForm.textContent =
            formLetters.join("");

    }

}



/* =========================================
   STATS PAGE
   DISPLAY COMPLETE STATISTICS
========================================= */

function displayStatisticsPage() {

    const statsPageCheck =
        document.getElementById(
            "statsAccuracy"
        );


    if (!statsPageCheck) {

        return;

    }


    if (
        typeof completedPredictions ===
            "undefined" ||
        completedPredictions.length === 0
    ) {

        return;

    }


    /* =====================================
       BASIC TOTALS
    ===================================== */

    const total =
        completedPredictions.length;


    const correct =
        completedPredictions.filter(
            function (prediction) {

                return (
                    prediction.correct === true
                );

            }
        ).length;


    const incorrect =
        total - correct;


    const accuracy =
        calculatePercentage(
            correct,
            total
        );


    const incorrectPercentage =
        calculatePercentage(
            incorrect,
            total
        );



    /* =====================================
       GET MAIN ELEMENTS
    ===================================== */

    const statsAccuracy =
        document.getElementById(
            "statsAccuracy"
        );


    const statsAccuracySmall =
        document.getElementById(
            "statsAccuracySmall"
        );


    const statsAccuracyBar =
        document.getElementById(
            "statsAccuracyBar"
        );


    const statsRecord =
        document.getElementById(
            "statsRecord"
        );


    const statsTotal =
        document.getElementById(
            "statsTotal"
        );


    const statsCorrect =
        document.getElementById(
            "statsCorrect"
        );


    const statsIncorrect =
        document.getElementById(
            "statsIncorrect"
        );



    /* =====================================
       DISPLAY MAIN TOTALS
    ===================================== */

    if (statsAccuracy) {

        statsAccuracy.textContent =
            formatPercentage(
                accuracy
            );

    }


    if (statsAccuracySmall) {

        statsAccuracySmall.textContent =
            formatPercentage(
                accuracy
            );

    }


    if (statsAccuracyBar) {

        statsAccuracyBar.style.width =
            accuracy + "%";

    }


    if (statsRecord) {

        statsRecord.textContent =
            correct + " - " + incorrect;

    }


    if (statsTotal) {

        statsTotal.textContent =
            total;

    }


    if (statsCorrect) {

        statsCorrect.textContent =
            correct;

    }


    if (statsIncorrect) {

        statsIncorrect.textContent =
            incorrect;

    }



    /* =====================================
       CONFIDENCE GROUPS
    ===================================== */

    const highConfidence =
        getConfidenceGroup(
            70,
            Infinity
        );


    const mediumConfidence =
        getConfidenceGroup(
            60,
            69
        );


    const lowConfidence =
        getConfidenceGroup(
            0,
            59
        );


    updateConfidenceCard(
        "high",
        highConfidence
    );


    updateConfidenceCard(
        "medium",
        mediumConfidence
    );


    updateConfidenceCard(
        "low",
        lowConfidence
    );



    /* =====================================
       BEST CONFIDENCE GROUP
    ===================================== */

    const confidenceGroups = [

        highConfidence,

        mediumConfidence,

        lowConfidence

    ];


    const activeConfidenceGroups =
        confidenceGroups.filter(
            function (group) {

                return (
                    group.total > 0
                );

            }
        );


    let bestConfidenceAccuracy = 0;


    if (
        activeConfidenceGroups.length > 0
    ) {

        bestConfidenceAccuracy =
            Math.max(
                ...activeConfidenceGroups.map(
                    function (group) {

                        return (
                            group.accuracy
                        );

                    }
                )
            );

    }


    const statsBestConfidence =
        document.getElementById(
            "statsBestConfidence"
        );


    if (statsBestConfidence) {

        statsBestConfidence.textContent =
            formatPercentage(
                bestConfidenceAccuracy
            );

    }



    /* =====================================
       BREAKDOWN BARS
    ===================================== */

    const correctBreakdownPercentage =
        document.getElementById(
            "correctBreakdownPercentage"
        );


    const incorrectBreakdownPercentage =
        document.getElementById(
            "incorrectBreakdownPercentage"
        );


    const correctBreakdownBar =
        document.getElementById(
            "correctBreakdownBar"
        );


    const incorrectBreakdownBar =
        document.getElementById(
            "incorrectBreakdownBar"
        );


    if (correctBreakdownPercentage) {

        correctBreakdownPercentage.textContent =
            formatPercentage(
                accuracy
            );

    }


    if (incorrectBreakdownPercentage) {

        incorrectBreakdownPercentage.textContent =
            formatPercentage(
                incorrectPercentage
            );

    }


    if (correctBreakdownBar) {

        correctBreakdownBar.style.width =
            accuracy + "%";

    }


    if (incorrectBreakdownBar) {

        incorrectBreakdownBar.style.width =
            incorrectPercentage + "%";

    }



    /* =====================================
       RECENT FORM
    ===================================== */

    displayRecentForm();

}



/* =========================================
   INITIALIZE COMPLETE WEBSITE
========================================= */


/* =========================================
   MATCHINTEL - FLAG RENDERER FIX
========================================= */

function renderMatchIntelFlag(teamName, flagUrl, fallbackFlag) {

    if (flagUrl) {
        return `
            <img
                class="matchintel-team-flag"
                src="${flagUrl}"
                alt="${teamName || "Team"} flag"
                width="40"
                height="27"
                loading="lazy"
                decoding="async"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';"
            >
            <span
                class="team-flag matchintel-team-flag-fallback"
                style="display:none"
                aria-hidden="true"
            >
                ${fallbackFlag || "⚽"}
            </span>
        `;
    }

    return `
        <span
            class="team-flag matchintel-team-flag-fallback"
            aria-hidden="true"
        >
            ${fallbackFlag || "⚽"}
        </span>
    `;
}

function initializeMatchIntelWebsite() {

    try {

        displayTopPredictions();
        displayPerformanceStats();
        displayLatestAnalysis();

        if (typeof predictions !== "undefined") {
            displayAllPredictions(predictions);
        }

        setupPredictionFilters();

        renderActiveResultsFilter();

        displayResultsSummary();
        setupResultFilters();
        displayStatisticsPage();

    } catch (error) {

        console.error("MATCHINTEL INITIALIZATION ERROR:", error);

        const predictionArea =
            document.getElementById("allPredictionsGrid") ||
            document.getElementById("predictionGrid");

        if (predictionArea) {
            predictionArea.innerHTML = `
                <div class="empty-message">
                    MatchIntel could not load predictions.<br>
                    <strong>${String(error.message || error)}</strong>
                </div>
            `;
        }

    }

}


/* =========================================
   STEP 27D-2C-3
   LIVE-SYNC-AWARE INITIALIZATION
========================================= */

let matchIntelHasInitialized = false;
let matchIntelRefreshQueued = false;


function renderMatchIntelWebsite() {

    initializeMatchIntelWebsite();

    matchIntelHasInitialized = true;

}


async function startMatchIntelWebsite() {

    /*
       Wait for the first live sync when available.
       If backend/API fails, live-sync.js resolves safely
       and the original static prediction data still renders.
    */

    if (
        window.MatchIntelLiveSync &&
        window.MatchIntelLiveSync.ready
    ) {

        try {

            await window.MatchIntelLiveSync.ready;

        } catch (error) {

            console.warn(
                "MATCHINTEL LIVE SYNC STARTUP FALLBACK:",
                error
            );

        }

    }


    renderMatchIntelWebsite();


    /*
       Refresh every 2 minutes.
       live-sync.js handles API caching and errors.
    */

    if (
        window.MatchIntelLiveSync &&
        typeof window.MatchIntelLiveSync.refreshEvery === "function"
    ) {

        window.MatchIntelLiveSync.refreshEvery(
            2 * 60 * 1000
        );

    }

}


/*
   When fresh live data arrives later,
   safely redraw visible sections.
*/

window.addEventListener(
    "matchintel:live-data-ready",
    function () {

        if (!matchIntelHasInitialized) {
            return;
        }

        if (matchIntelRefreshQueued) {
            return;
        }

        matchIntelRefreshQueued = true;

        requestAnimationFrame(
            function () {

                renderMatchIntelWebsite();

                matchIntelRefreshQueued = false;

            }
        );

    }
);


/*
   Start only after the HTML document is ready.
*/

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        startMatchIntelWebsite,
        { once: true }
    );

} else {

    startMatchIntelWebsite();

}