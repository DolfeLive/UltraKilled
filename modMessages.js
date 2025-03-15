// broken 2 = BROKEN
// broken 1 = SLIGHTLY BROKEN
// broken 0 = WORKING

// You can have capital letters if ya want (it all gets lowered anyway)

const customModMessages = {
    'angrylevelloader ': {
        broken: 1,
        message: `At the time of writing this, the mod internally is fixed but the update will be released later because map makers need to fix their maps`
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

export { customModMessages };