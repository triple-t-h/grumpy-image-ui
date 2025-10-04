/******  Example usage:
 **           https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
 **
 **          class MyClass extends mix(MyBaseClass).with(Mixin1, Mixin2) {
 **              ...
 **          }
 *******/

// Base constructor type
type Constructor<T = {}> = new (...args: any[]) => T

// Mixin function type - takes a constructor and returns a constructor
type MixinFunction<T = {}> = <U extends Constructor>(Base: U) => Constructor<T> & U

// MixinBuilder with generics
class MixinBuilder<T extends Constructor> {
    constructor(private superclass: T) {}

    with<M1>(m1: MixinFunction<M1>): Constructor<InstanceType<T> & M1>
    with<M1, M2>(m1: MixinFunction<M1>, m2: MixinFunction<M2>): Constructor<InstanceType<T> & M1 & M2>
    with<M1, M2, M3>(m1: MixinFunction<M1>, m2: MixinFunction<M2>, m3: MixinFunction<M3>): Constructor<InstanceType<T> & M1 & M2 & M3>
    with<M1, M2, M3, M4>(m1: MixinFunction<M1>, m2: MixinFunction<M2>, m3: MixinFunction<M3>, m4: MixinFunction<M4>): Constructor<InstanceType<T> & M1 & M2 & M3 & M4>
    with(...mixins: MixinFunction<any>[]): any {
        return mixins.reduce((c, mixin) => mixin(c), this.superclass)
    }
}

// Factory function with generics
function mix<T extends Constructor>(superclass: T): MixinBuilder<T> {
    return new MixinBuilder(superclass)
}

export { mix, type Constructor, type MixinFunction }
