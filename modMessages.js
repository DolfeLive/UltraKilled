// broken 2 = BROKEN
// broken 1 = SLIGHTLY BROKEN
// broken 0 = WORKING

// You can have capital letters if ya want (it all gets lowered anyway)

const customModMessages = {
    'r2modman': {
        broken: 0,
        message: 'R2ModMan is a mod manager not a mod and so wont break on update'
    },
    'bepinex': {
        broken: 0,
        message: 'bepinex is a mod loader and will work even after an update BUT you may need to set hidemanagergameobject to true in config'
    },
};

export { customModMessages };
