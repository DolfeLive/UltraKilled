document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('searchBar');
    const searchBtn = document.getElementById('searchBtn');
    const results = document.getElementById('results');
    const helpContent = document.getElementById('helpContent');
    const modName = document.getElementById('modName');
    const statusText = document.getElementById('statusText');
    const statusIndicator = document.getElementById('statusIndicator');
    const modDetails = document.getElementById('modDetails');
    let modList;
    
    let errorHappened = false;
    let errorMsg;
    
    fetch('https://thunderstore.io/c/ultrakill/api/v1/package/') // i would be very happy if there was another api
    .then(response => {
        const contentLength = response.headers.get('Content-Length');
        console.log(`Total fetch size: ${contentLength} bytes`);

        return response.json();
    })    .then(data => {
        modList = data.map(mod => {
            const unixTimestamp = new Date(mod.date_updated).getTime() / 1000;
            return {
                modName: mod.name,
                unixTimestamp: unixTimestamp
            };
        });
        console.log(modList);
    })
    .catch(error => {
        console.error('Error fetching data:', error)
        errorHappened = true;
        errorMsg = error;
    });
    
    const breakingUpdates = {
        majorUpdate1: {
            date: 1740420240, // Feb 25, 2025 5:04AM AEDT // Revamp
            brokenness: 1         // Very Broken
        },
        majorUpdate2: {
            date: 1713209760, // Aprl 16, 2024 5:36AM AEDT // Full arsenal
            brokenness: 2         // Very Slightly broken
        },
        majorUpdate3: {
            date: 1703097000, // Dec 21, 2023 5:30AM AEDT // Layer 7
            brokenness: 3         // Completely broken
        }
    };
    
    const customModMessages = {
        'angrylevelloader ': {
            broken: 1,
            message: 'At the time of writing this, the mod internally is fixed but the update will be released later because map makers need to fix their maps'
        },
        'rude': {
            broken: 1,
            message: 'At the time of writing this, the mod internally is fixed but the update will be released later because map makers need to fix their maps'
        },
        'UltraModManager': {
            broken: 2,
            message: 'This mod was last updated over 2 years ago and deprecated'
        },
        'r2modman': {
            broken: 0,
            message: 'R2ModMan is a mod manager not a mod and so wont break on update'
        },
        'bepinex': {
            broken: 0,
            message: 'bepinex is a mod loader and will work even after an update BUT you may need to set hidemanagergameobject to true in config'
        },
        'jaket': {
            broken: 2,
            message: 'Jaket wont be updated for a while, just wait or downpatch downpatch guide linked in main page or just follow this link: https://steamcommunity.com/sharedfiles/filedetails/?id=1086279994'
        }
    };

    function handleSearch() {
        const query = searchBar.value.trim();
        if (!query) return;
        
        checkModStatus(query);
    }

    function checkModStatus(modQuery) {
        console.log(`Checking status for: ${modQuery}`);
        
        results.classList.remove('hidden');
        helpContent.classList.add('hidden');
        
        modName.textContent = modQuery;
        
        fetchModData(modQuery)
        .then(data => {
            for (const mod in customModMessages) {
                if (mod.toLowerCase().trim() === modQuery.toLowerCase().trim()) {
                    const info = customModMessages[mod];
                    updateStatus(info.broken, info.message);
                    return;
                }
            }
            if (!data.exactMatch) {
                modName.textContent = `${data.modName} (closest match to "${modQuery}")`;
            }
            
            const modDate = data.lastUpdateEpoch;
            const isOutdated = checkIfOutdated(modDate);
            
            const normalizedModName = data.modName.toLowerCase().trim();
            
            for (const mod in customModMessages) {
                if (mod.toLowerCase().trim() === normalizedModName) {
                    const info = customModMessages[mod];
                    updateStatus(info.broken, info.message);
                    return;
                }
            }
            
            let message = getDefaultMessage(isOutdated, modDate * 1000);
            
            updateStatus(isOutdated, message);
        })
        .catch(error => {
            console.error('Error:', error);
            statusText.textContent = 'NOT FOUND';
            statusIndicator.className = 'status status-unknown';
            modDetails.textContent = `Couldn't find a mod matching "${modQuery}". Please check your spelling or try another mod name.`;
        });
    }
    
    function checkIfOutdated(modDateEpoch) {
        for (const update in breakingUpdates) {
            const updateInfo = breakingUpdates[update];
            if (modDateEpoch < updateInfo.date) {
                return updateInfo.brokenness;
            }
        }
        return 0;
    }
    
    function getDefaultMessage(isBroken, modDateEpoch) {
        if (isBroken) {
            const updateDate = new Date(modDateEpoch).toLocaleDateString();
            return `This mod was last updated on ${updateDate}, which is before a major game update. It's likely incompatible with the current game version.`;
        } else {
            return 'This mod appears to be compatible with the current game version.';
        }
    }
    
    function updateStatus(brokenness, message) {
        if (brokenness === 2) {
            statusText.textContent = 'BROKEN';
            statusIndicator.className = 'status status-broken';
        } else if (brokenness === 1) {
            statusText.textContent = 'SLIGHTLY BROKEN';
            statusIndicator.className = 'status status-slightly-broken';
        } else {
            statusText.textContent = 'WORKING';
            statusIndicator.className = 'status status-working';
        }
        modDetails.textContent = message;
    }
    
    function fetchModData(modQuery) {
        return new Promise((resolve, reject) => {
            if (errorHappened) {
                reject(errorMsg);
                return;
            }
            
            if (!modList || modList.length === 0) {
                reject("Mod list not loaded yet. Please try again in a moment.");
                return;
            }
            
            const bestMatch = findClosestMatch(modQuery, modList);
            
            if (bestMatch) {
                resolve({
                    modName: bestMatch.modName,
                    lastUpdateEpoch: bestMatch.unixTimestamp,
                    exactMatch: bestMatch.modName.toLowerCase() === modQuery.toLowerCase()
                });
            } else {
                reject("No matching mod found.");
            }
        });
    }
    
    function findClosestMatch(query, mods) {
        let queryLower = query.toLowerCase().replace(/\s+/g, ''); // + remove spaces
        
        let bestMatch = null;
        let bestScore = Infinity;
        
        const exactMatch = mods.find(mod => mod.modName.toLowerCase() === queryLower);
        if (exactMatch) {
            return exactMatch;
        }
        
        const partialMatches = mods.filter(mod => 
            mod.modName.toLowerCase().includes(queryLower)
        );
        
        if (partialMatches.length > 0) {
            for (const mod of partialMatches) {
                const distance = levenshteinDistance(queryLower, mod.modName.toLowerCase());
                if (distance < bestScore) {
                    bestScore = distance;
                    bestMatch = mod;
                }
            }
        } else {
            for (const mod of mods) {
                const distance = levenshteinDistance(queryLower, mod.modName.toLowerCase());
                if (distance < bestScore) {
                    bestScore = distance;
                    bestMatch = mod;
                }
            }
        }
        
        if (bestScore <= Math.max(5, queryLower.length / 2)) {
            return bestMatch;
        }
        
        return null;
    }
    
    function levenshteinDistance(str1, str2) {
        const m = str1.length;
        const n = str2.length;
        
        const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
        
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,      
                    dp[i][j - 1] + 1,      
                    dp[i - 1][j - 1] + cost
                );
            }
        }
        
        return dp[m][n];
    }
    
    searchBtn.addEventListener('click', handleSearch);
    searchBar.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    document.addEventListener('click', (e) => {
        if (e.target.id === 'backToHelp') {
            results.classList.add('hidden');
            helpContent.classList.remove('hidden');
        }
    });
});