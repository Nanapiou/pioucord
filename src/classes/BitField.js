/**
 * @typedef {number | string | bigint | array} BitfieldResolvable
 */

export default class BitField {
    /**
     * @param {BitfieldResolvable} defaultValue
     * @param {$ObjMap<string, number>} flags
     */
    constructor(defaultValue, flags) {
        this.flags = flags;
        /**
         * @type {bigint}
         * @private
         */
        this._bitfield = this.resolve(defaultValue ?? 0n);
    };

    /**
     * @returns {bigint}
     */
    get bitfield() {
        return this._bitfield;
    };

    /**
     * Add some bits to the bitfield
     * @param {BitfieldResolvable} value
     * @returns {BitField}
     */
    add(value) {
        this._bitfield |= this.resolve(value);
        return this;
    };

    /**
     * Remove some bits from the bitfield
     * @param {BitfieldResolvable} value
     * @returns {BitField}
     */
    remove(value) {
        this._bitfield &= ~this.resolve(value);
        return this;
    };

    /**
     * Check if the bitfield has a (or many) bit
     * @param {BitfieldResolvable} value
     * @returns {boolean}
     */
    has(value) {
        const resolved = this.resolve(value);
        return (this._bitfield & resolved) === resolved;
    };

    /**
     * Check if the bitfield has any bit
     * @param {BitfieldResolvable} value
     * @returns {boolean}
     */
    hasAny(value) {
        for (const bit of new BitField(value, this.flags)) {
            if ((this._bitfield & bit) === bit) return true;
        }
        return false;
    };

    /**
     * Convert the bitfield to an array of strings, using flags
     * @returns {string[]}
     */
    toArray() {
        return [...this].map(bit => this.flags[Number(bit)] ?? bit);
    };

    /**
     * Serialize any type to a bigint
     * @param {BitfieldResolvable} value
     * @returns {bigint}
     */
    resolve(value) {
        switch (typeof value) {
            case "bigint":
                return value;
            case "number":
                return BigInt(value);
            case "object":
                const val = value.reduce?.((a, c) => a | this.resolve(c), 0n);
                if (val !== undefined) return val;
                else throw new TypeError('Invalid type');
            case "string":
                const bit = BigInt(this.flags?.[value]);
                if (bit === undefined) throw new Error('Cannot find ' + value);
                return bit;
            default:
                throw new TypeError('Invalid type');
        }
    };

    /**
     * Iterate over the bitfield
     * @returns {Generator<bigint, void, *>}
     */
    *[Symbol.iterator]() {
        let temp = this._bitfield, place = 0n;
        while (temp !== 0n) {
            if (temp % 2n === 1n) yield 1n << place;
            temp /= 2n;
            place += 1n;
        }
    }
}