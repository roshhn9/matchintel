require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;
const FOOTBALL_DATA_BASE_URL = "https://api.football-data.org/v4";

app.use(cors());
app.use(express.json());


/* =========================================
   STEP 27D-2C-10
   STATUS-AWARE IN-MEMORY CACHE
========================================= */

const cache = new Map();

const CACHE_TTL = {
    MATCH_LIST: 5 * 60 * 1000,
    LIVE_MATCH: 60 * 1000,
    UPCOMING_MATCH: 5 * 60 * 1000,
    FINISHED_MATCH: 24 * 60 * 60 * 1000,
    POSTPONED_MATCH: 30 * 60 * 1000
};

function getCached(key) {
    const item = cache.get(key);

    if (!item) {
        return null;
    }

    if (Date.now() > item.expiresAt) {
        cache.delete(key);
        return null;
    }

    return item.data;
}

function setCached(key, data, ttlMs) {
    cache.set(key, {
        data,
        expiresAt: Date.now() + ttlMs
    });
}

function getMatchCacheTtl(status) {
    switch (String(status || "").toUpperCase()) {
        case "FINISHED":
            return CACHE_TTL.FINISHED_MATCH;

        case "IN_PLAY":
        case "PAUSED":
            return CACHE_TTL.LIVE_MATCH;

        case "POSTPONED":
        case "SUSPENDED":
            return CACHE_TTL.POSTPONED_MATCH;

        case "SCHEDULED":
        case "TIMED":
        default:
            return CACHE_TTL.UPCOMING_MATCH;
    }
}

function seedIndividualMatchCache(matches) {
    if (!Array.isArray(matches)) {
        return;
    }

    matches.forEach(function (match) {
        if (!match || !Number.isInteger(Number(match.id))) {
            return;
        }

        setCached(
            `/matches/${Number(match.id)}`,
            match,
            getMatchCacheTtl(match.status)
        );
    });
}


/* =========================================
   SAFE FOOTBALL-DATA REQUEST HELPER
========================================= */

async function footballDataRequest(endpoint) {

    if (!process.env.FOOTBALL_DATA_TOKEN) {
        throw new Error(
            "FOOTBALL_DATA_TOKEN is missing from the .env file."
        );
    }

    const response = await fetch(
        FOOTBALL_DATA_BASE_URL + endpoint,
        {
            headers: {
                "X-Auth-Token":
                    process.env.FOOTBALL_DATA_TOKEN
            }
        }
    );

    const requestsAvailable =
        response.headers.get("x-requestsavailable");

    const resetSeconds =
        response.headers.get("x-requestcounter-reset");

    console.log(
        `[football-data] ${response.status} ${endpoint} | ` +
        `remaining: ${requestsAvailable ?? "unknown"} | ` +
        `reset: ${resetSeconds ?? "unknown"}s`
    );

    if (response.status === 429) {
        throw new Error(
            `Football API rate limit reached. Try again in ` +
            `${resetSeconds || "a few"} seconds.`
        );
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            `Football API request failed with status ${response.status}.`
        );
    }

    return data;
}


/* =========================================
   HEALTH CHECK
========================================= */

app.get("/api/health", function (req, res) {
    res.json({
        ok: true,
        service: "MatchIntel Backend",
        tokenConfigured:
            Boolean(process.env.FOOTBALL_DATA_TOKEN),
        cacheEntries: cache.size,
        time: new Date().toISOString()
    });
});


/* =========================================
   UPCOMING / CURRENT MATCHES
========================================= */

app.get("/api/matches", async function (req, res) {

    try {

        const dateFrom = req.query.dateFrom;
        const dateTo = req.query.dateTo;

        const params =
            new URLSearchParams();

        if (dateFrom) {
            params.set("dateFrom", dateFrom);
        }

        if (dateTo) {
            params.set("dateTo", dateTo);
        }

        const query =
            params.toString()
                ? `?${params.toString()}`
                : "";

        const cacheKey =
            `/matches${query}`;

        const cached =
            getCached(cacheKey);

        if (cached) {
            seedIndividualMatchCache(cached.matches);

            return res.json({
                source: "cache",
                ...cached
            });
        }

        const data =
            await footballDataRequest(
                `/matches${query}`
            );

        const payload = {
            count:
                data.resultSet?.count ??
                data.matches?.length ??
                0,
            matches: data.matches || []
        };

        setCached(
            cacheKey,
            payload,
            CACHE_TTL.MATCH_LIST
        );

        /*
           Important optimization:
           Every match received in /matches is also cached
           under /matches/:matchId.

           This prevents live-sync.js from making another
           football-data.org request for the same match.
        */

        seedIndividualMatchCache(payload.matches);

        res.json({
            source: "football-data.org",
            ...payload
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            ok: false,
            error: error.message
        });

    }

});


/* =========================================
   ONE MATCH BY FOOTBALL-DATA MATCH ID
========================================= */

app.get("/api/matches/:matchId", async function (req, res) {

    try {

        const matchId =
            Number(req.params.matchId);

        if (!Number.isInteger(matchId)) {
            return res.status(400).json({
                ok: false,
                error: "Invalid match ID."
            });
        }

        const cacheKey =
            `/matches/${matchId}`;

        const cached =
            getCached(cacheKey);

        if (cached) {
            return res.json({
                source: "cache",
                match: cached
            });
        }

        const data =
            await footballDataRequest(
                `/matches/${matchId}`
            );

        const ttl =
            getMatchCacheTtl(data.status);

        setCached(
            cacheKey,
            data,
            ttl
        );

        console.log(
            `[MatchIntel Cache] Match ${matchId} ` +
            `status=${data.status || "UNKNOWN"} ` +
            `ttl=${Math.round(ttl / 1000)}s`
        );

        res.json({
            source: "football-data.org",
            match: data
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            ok: false,
            error: error.message
        });

    }

});


/* =========================================
   START SERVER
========================================= */

app.listen(PORT, function () {
    console.log("");
    console.log("=========================================");
    console.log(" MatchIntel backend is running");
    console.log(` http://localhost:${PORT}`);
    console.log(` Health: http://localhost:${PORT}/api/health`);
    console.log(" Status-aware cache: ON");
    console.log("=========================================");
    console.log("");
});
