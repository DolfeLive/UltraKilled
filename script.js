document.addEventListener('DOMContentLoaded', async () => {
    let { customModMessages } = await import("./modMessages.js");
    
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
                unixTimestamp: unixTimestamp,
                url: mod.package_url,
                deprecated: mod.is_deprecated,
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
      violentNight: {
        date: 1703104449, // 2023-12-20 20:34:09 UTC Patch 14: VIOLENT NIGHT
        brokenness: 3
      },
      fullArsenal: {
        date: 1713208388, // 2024-04-15 19:13:08 UTC Patch 15: FULL ARSENAL
        brokenness: 2
      },
      ultraRevamp: {
        date: 1740420366, // 2025-02-24 18:06:06 UTC Patch 16: ULTRA_REVAMP
        brokenness: 3
      },
      ultraRevamp_16d: {
        date: 1743005345, // 2025-03-26 16:09:05 UTC Patch 16d hotfix
        brokenness: 2
      },
      fraud: {
        date: 1771981995, // 2026-02-25 01:13:15 UTC Patch 17: FRAUD (Layer 8)
        brokenness: 3
      }
    };
    
    function handleSearch() {
        const query = searchBar.value.trim();
        if (!query) return;
        
        searchMods(query);
    }

    function searchMods(modQuery) {
        console.log(`Searching for: ${modQuery}`);
        
        results.classList.remove('hidden');
        helpContent.classList.add('hidden');
        
        results.innerHTML = '';
        
        const backButton = document.createElement('button');
        backButton.id = 'backToHelp';
        backButton.textContent = 'Back to Help';
        backButton.className = 'back-button';
        results.appendChild(backButton);
        
        const resultsHeading = document.createElement('h2');
        resultsHeading.textContent = `Search Results for "${modQuery}"`;
        results.appendChild(resultsHeading);
        
        const queryLower = modQuery.toLowerCase().trim();
        let foundCustomMod = false;
        
        for (const customMod in customModMessages) {
            if (customMod.toLowerCase().trim() === queryLower) {
                foundCustomMod = true;
                const customModInfo = customModMessages[customMod];
                
                const mockMod = {
                    modName: customMod,
                    unixTimestamp: Date.now() / 1000,
                    url: "#"
                };
                
                const resultsContainer = document.createElement('div');
                resultsContainer.className = 'results-container';
                results.appendChild(resultsContainer);
                
                const modCard = createModCard(mockMod, modQuery);
                resultsContainer.appendChild(modCard);
                break;
            }
        }
        fetchModMatches(modQuery, foundCustomMod)
            .then(matches => {
                if (matches.length === 0) {
                    const noResults = document.createElement('p');
                    noResults.textContent = `No mods found matching "${modQuery}". Please check your spelling or try another search term.`;
                    noResults.className = 'no-results';
                    results.appendChild(noResults);
                    return;
                }
                
                const resultsContainer = document.createElement('div');
                resultsContainer.className = 'results-container';
                results.appendChild(resultsContainer);
                
                matches.forEach(mod => {
                    const modCard = createModCard(mod, modQuery);
                    resultsContainer.appendChild(modCard);
                });
            })
            .catch(error => {
                console.error('Error:', error);
                const errorElement = document.createElement('p');
                errorElement.textContent = `Error: ${error}`;
                errorElement.className = 'error-message';
                results.appendChild(errorElement);
            });
    }
    
    function checkIfOutdated(modDateEpoch) {
        const updates = Object.values(breakingUpdates)
            .sort((a, b) => b.date - a.date);
    
        for (const updateInfo of updates) {
            if (modDateEpoch < updateInfo.date) {
                return updateInfo.brokenness;
            }
        }
        return 0;
    }
    
    function getDefaultMessage(isBroken, modDateEpoch, mod) {
        if (isBroken) {
            const updateDate = new Date(modDateEpoch).toLocaleDateString();
            return `${mod.modName} was last updated on ${updateDate}, which is before a major game update. It's likely incompatible with the current game version. It may work but dont count on it`;
        } else {
            return `${mod.modName} is most likey going to work with the current game version.`;
        }
    }
    
    function createModCard(mod, query) {
        const modCard = document.createElement('div');
        modCard.className = 'status-card';
        
        const modNameEl = document.createElement('h2');
        const modLink = document.createElement('a');
        modLink.href = mod.url;
        modLink.textContent = mod.modName;
        modLink.target = '_blank';
        
        modNameEl.appendChild(modLink);
        if (mod.modName.toLowerCase() !== query.toLowerCase()) {
            const matchInfo = document.createElement('span');
            matchInfo.textContent = `(match for "${query}")`;
            matchInfo.className = 'match-info';
            
            modNameEl.appendChild(document.createElement('br'));
            modNameEl.appendChild(matchInfo);
        }
        modCard.appendChild(modNameEl);
        
        const modDate = mod.unixTimestamp;
        let brokenness = checkIfOutdated(modDate);
        let message = getDefaultMessage(brokenness, modDate * 1000, mod);
        let deprecated = mod.deprecated ?? false;
        
        const normalizedModName = mod.modName.toLowerCase().trim();
        for (const customMod in customModMessages) {
            if (customMod.toLowerCase().trim() === normalizedModName) {
                const info = customModMessages[customMod];
                brokenness = info.broken;
                message = info.message;
                break;
            }
        }
        
        modCard.style.borderLeft = `5px solid ${brokenness === 2 ? '#da7272' : brokenness === 1 ? '#e0b567' : '#6ac174'}`;
        
        for (const customMod in customModMessages) {
            if (customMod.toLowerCase().trim() === normalizedModName) {
                const info = customModMessages[customMod];
                brokenness = info.broken;
                message = info.message;
                break;
            }
        }
        
        const statusIndicator = document.createElement('div');
        statusIndicator.className = 'status';
        const statusText = document.createElement('span');
        
        if (brokenness === 2) {
            statusText.textContent = 'BROKEN';
            statusIndicator.className += ' status-broken';
        } else if (brokenness === 1) {
            statusText.textContent = 'SLIGHTLY BROKEN';
            statusIndicator.className += ' status-slightly-broken';
        } else {
            statusText.textContent = 'WORKING';
            statusIndicator.className += ' status-working';
        }
        
        statusIndicator.appendChild(statusText);
        modCard.appendChild(statusIndicator);
        
        const deprecatedIndicator = document.createElement('div');
        deprecatedIndicator.className = 'status';
        const deprecatedText = document.createElement('span');
        
        if (deprecated == true)
        {
            deprecatedText.textContent = 'Deprecated';
            deprecatedIndicator.className += ' status-deprecated';
        }
        
        deprecatedIndicator.appendChild(deprecatedText);
        modCard.appendChild(deprecatedIndicator);
        
        
        const details = document.createElement('p');
        details.textContent = message;
        modCard.appendChild(details);
        
        return modCard;
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
    
    function fetchModMatches(modQuery, foundCustomMod) {
        return new Promise((resolve, reject) => {
            if (errorHappened) {
                reject(errorMsg);
                return;
            }
            
            if (!modList || modList.length === 0) {
                reject("Mod list not loaded yet. Please try again in a moment.");
                return;
            }
            
            const matches = findMatches(modQuery, modList, foundCustomMod);
            resolve(matches);
        });
    }
    
    function findMatches(query, mods, foundCustomMod) {
        const queryLower = query.toLowerCase().replace(/\s+/g, '');
        
        const numElements = foundCustomMod ? 7 : 8;
        
        const exactMatch = mods.find(mod => mod.modName.toLowerCase() === queryLower);
        if (exactMatch) {
            return [exactMatch];
        }
        
        const partialMatches = mods.filter(mod => 
            mod.modName.toLowerCase().includes(queryLower)
        );
        
        if (partialMatches.length > 0) {
            partialMatches.sort((a, b) => {
                const aDistance = levenshteinDistance(queryLower, a.modName.toLowerCase());
                const bDistance = levenshteinDistance(queryLower, b.modName.toLowerCase());
                return aDistance - bDistance;
            });
            return partialMatches.slice(0, numElements);
        }
        
        const allMatches = mods.map(mod => {
            const distance = levenshteinDistance(queryLower, mod.modName.toLowerCase());
            return {
                ...mod,
                distance
            };
        });
        
        allMatches.sort((a, b) => a.distance - b.distance);
        
        const maxDistance = Math.max(5, queryLower.length / 2);
        const closeMatches = allMatches
            .filter(mod => mod.distance <= maxDistance)
            .slice(0, numElements);
        
        return closeMatches;
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
    
    document.getElementById('switchFontBtn').addEventListener('click', function() {
        const body = document.body;
        const btn = document.getElementById('switchFontBtn');
        
        body.classList.toggle('arial-font');
        
        if (body.classList.contains('arial-font')) {
            btn.textContent = 'Switch Font to VCR';
        } else {
            btn.textContent = 'Switch Font to Arial';
        }
    });
});
