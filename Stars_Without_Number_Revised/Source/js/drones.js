/* global getAttrs, setAttrs, getSectionIDs, generateRowID, on, removeRepeatingRow, _, getTranslationByKey */

/* Drones */
const fillDroneStats = () => {
    // This must be run from a repeating event, otherwise it will not know where to draw the data from.
    getAttrs(["repeating_drones_drone_model"], v => {
        const model = (v.repeating_drones_drone_model || "").toLowerCase().trim().replace(/ /g, "_");
        if (autofillData.drones.hasOwnProperty(model)) {
            const setting = Object.entries(autofillData.drones[model]).reduce((m, [key, value]) => {
                m[`repeating_drones_${key}`] = value;
                return m;
            }, {});
            setting.repeating_drones_drone_HP_max = setting.repeating_drones_drone_HP;
            setAttrs(setting);
        }
    });
};
const fillDroneFitting = (num) => {
    const prefix = `repeating_drones_drone_fitting_${num}`;
    getAttrs([`${prefix}_desc`, `${prefix}_name`], v => {
        const fittingName = (v[`${prefix}_name`] || "").toLowerCase().trim().replace(/ /g, "_");
        if (v[`${prefix}_desc`] === "" && autofillData.droneFittings.includes(fittingName)) {
            setAttrs({
                [`${prefix}_desc`]: translate(`${fittingName.toUpperCase()}_DESC`)
            });
        }
    });
};
const calculateDroneAttack = (prefixes, callback) => {
    const sourceAttrs = prefixes.reduce((m, prefix) => {
        return m.concat([
            `${prefix}_drone_weapon1_ab`,
            `${prefix}_drone_weapon1_active`,
            `${prefix}_drone_weapon1_attack`,
            `${prefix}_drone_weapon2_ab`,
            `${prefix}_drone_weapon2_active`,
            `${prefix}_drone_weapon2_attack`,
            `${prefix}_drone_weapon3_ab`,
            `${prefix}_drone_weapon3_active`,
            `${prefix}_drone_weapon3_attack`,
        ]);
    }, ["attack_bonus", "intelligence_mod", "skill_pilot", "skill_program"]);
    getAttrs(sourceAttrs, v => {
        const skillMod = Math.max(parseInt(v.skill_pilot), parseInt(v.skill_program)) || 0,
            intMod = parseInt(v.intelligence_mod) || 0,
            attackBonus = parseInt(v.attack_bonus) || 0;

        const setting = prefixes.reduce((m, prefix) => {
            [1, 2, 3].filter(num => v[`${prefix}_drone_weapon${num}_active`] === "1")
                .forEach(num => {
                    m[`${prefix}_drone_weapon${num}_attack`] = intMod +
                        ((skillMod === -1) ? -2 : skillMod) + attackBonus +
                        parseInt(v[[`${prefix}_drone_weapon${num}_ab`]] || 0);
                });
            return m;
        }, {});
        mySetAttrs(setting, v, callback);
    });
};