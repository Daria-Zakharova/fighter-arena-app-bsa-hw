import controls from '../../constants/controls';

const randomize = () => Math.random() + 1;

export function getHitPower(fighter) {
    // return hit power
    const criticalHitChance = randomize();
    const { attack } = fighter;
    const power = attack * criticalHitChance;
    return power;
}

export function getBlockPower(fighter) {
    // return block power
    if (!fighter.isBlocking) {
        return 0;
    }
    const dodgeChance = randomize();
    const { defense } = fighter;
    const power = defense * dodgeChance;
    return power;
}

export function getDamage(attacker, defender) {
    // return damage
    const damage = attacker.hitsCritical ? attacker.attack * 2 : getHitPower(attacker) - getBlockPower(defender);
    return damage > 0 ? damage : 0;
}

class Fighter {
    constructor({ fighter, position }) {
        const { name, health, attack, defense } = fighter;
        this.name = name;
        this.totalHealth = health;
        this.currentHealth = health;
        this.attackPower = attack;
        this.defensePower = defense;
        this.isBlocking = false;
        this.hitsCritical = false;
        this.lastCriticalHitTime = null;
        this.isDead = false;
        this.refs = {
            indicator: document.getElementById(`${position}-fighter-indicator`)
        };
    }

    countHealthPercent = () => {
        const percentLeft = this.currentHealth / this.totalHealth;
        this.refs.indicator.style.transform = `scaleX(${percentLeft})`;
        if (percentLeft > 0.66) {
            this.refs.indicator.style.backgroundColor = 'green';
        } else if (percentLeft > 0.33) {
            this.refs.indicator.style.backgroundColor = '#ff6904';
        } else {
            this.refs.indicator.style.backgroundColor = 'red';
        }
    };

    tryCriticalAttack = victim => {
        const timeSinceCritical = Date.now() - this.lastCriticalHitTime;
        const isReloaded = timeSinceCritical > 10000;

        if (this.isBlocking || !isReloaded) {
            return;
        }
        this.hitsCritical = true;
        victim.getDamaged(this);
        this.setCriticalReload();
    };

    setCriticalReload = () => {
        this.hitsCritical = false;
        this.lastCriticalHitTime = Date.now();
    };

    getDamaged = damager => {
        const attacker = {
            attack: damager.attackPower,
            hitsCritical: damager.hitsCritical
        };
        const defender = {
            name: this.name,
            defense: this.defensePower,
            isBlocking: this.isBlocking
        };
        const damage = getDamage(attacker, defender);
        this.currentHealth -= damage;
        this.countHealthPercent();

        if (this.currentHealth <= 0) {
            this.isDead = true;
        }
    };
}

export async function fight(firstFighter, secondFighter) {
    const playerOne = new Fighter({ fighter: firstFighter, position: 'left' });
    const playerTwo = new Fighter({ fighter: secondFighter, position: 'right' });
    const playerOneCriticalCombo = {};
    const playerTwoCriticalCombo = {};

    const trackBlocking = e => {
        if (e.code === controls.PlayerOneBlock) {
            playerOne.isBlocking = e.type === 'keydown';
        }
        if (e.code === controls.PlayerTwoBlock) {
            playerTwo.isBlocking = e.type === 'keydown';
        }
    };

    const trackAttack = e => {
        if (e.code === controls.PlayerOneAttack && !playerOne.isBlocking) {
            playerTwo.getDamaged(playerOne);
        }
        if (e.code === controls.PlayerTwoAttack && !playerTwo.isBlocking) {
            playerOne.getDamaged(playerTwo);
        }
    };

    const trackCriticalAttack = e => {
        if (controls.PlayerOneCriticalHitCombination.includes(e.code)) {
            playerOneCriticalCombo[e.code] = e.type === 'keydown';
            if (Object.values(playerOneCriticalCombo).filter(Boolean).length === 3) {
                playerOne.tryCriticalAttack(playerTwo);
            }
        }

        if (controls.PlayerTwoCriticalHitCombination.includes(e.code)) {
            playerTwoCriticalCombo[e.code] = e.type === 'keydown';
            if (Object.values(playerTwoCriticalCombo).filter(Boolean).length === 3) {
                playerTwo.tryCriticalAttack(playerOne);
            }
        }
    };

    window.addEventListener('keydown', trackBlocking);
    window.addEventListener('keyup', trackBlocking);
    window.addEventListener('keyup', trackAttack);
    window.addEventListener('keydown', trackCriticalAttack);
    window.addEventListener('keyup', trackCriticalAttack);

    return new Promise(resolve => {
        // resolve the promise with the winner when fight is over
        const checkFightOver = () => {
            if (playerOne.isDead || playerTwo.isDead) {
                window.removeEventListener('keydown', trackBlocking);
                window.removeEventListener('keyup', trackBlocking);
                window.removeEventListener('keyup', trackAttack);
                window.removeEventListener('keydown', trackCriticalAttack);
                window.removeEventListener('keyup', trackCriticalAttack);
            }
            if (playerOne.isDead) {
                resolve(playerTwo);
            } else if (playerTwo.isDead) {
                resolve(playerOne);
            } else {
                setTimeout(checkFightOver, 100);
            }
        };

        checkFightOver();
    });
}
