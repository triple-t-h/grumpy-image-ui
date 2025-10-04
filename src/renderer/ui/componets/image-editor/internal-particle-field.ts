import { gsap } from "gsap";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import { PhysicsPropsPlugin } from "gsap/PhysicsPropsPlugin";
import "./internal-particle"; // Ensure the custom element is registered
import { Particle } from "./internal-particle";

export class ParticleField {
    constructor() {
        gsap.registerPlugin(Physics2DPlugin, PhysicsPropsPlugin);
    }

    public particles: Particle[] = [];

    private _isEven(number: number): boolean {
        // The modulo operator (%) returns the remainder of a division.
        // If the remainder of the number divided by 2 is 0, it's even.
        return number % 2 === 0;
    }

    lineExplosion(x: number, y: number, w: number, count: number = 150): Particle[] {
        this.particles.length = 0;

        for (let i = 0; i < count; i++) {

            const particle = document.createElement('particle-element') as Particle
            particle.x = x + i / count * w
            particle.y = y + gsap.utils.random(-5, 5) // Slight vertical randomness
            particle.angle = gsap.utils.random(145, 215) // More contained angle range (145-215 degrees)
            particle.gravity = gsap.utils.random(200, 500) // Increased gravity to pull particles down
            particle.hue = this._isEven(i) ? 345 : 340 // Alternate hues for even/odd particles
            particle.life = Math.random() * 0.4 + 0.6 // Slightly longer life
            particle.velocity = gsap.utils.random(80, 250) // Reduced velocity for more contained explosion        

            particle.setStyle()

            this.particles.push(particle)
        }
        return this.particles;
    }

    pointExplosion(x: number, y: number, count: number = 55): Particle[] {
        this.particles.length = 0;

        for (let i = 0; i < count; i++) {
            const rot = i / count * Math.PI * 2 // angle to apply velocity
                , particle = document.createElement('particle-element') as Particle
            particle.x = x + Math.cos(rot) * 18 // Spread out initial x position
            particle.y = y + Math.sin(rot) * 18 // Spread out initial y position
            particle.angle = gsap.utils.random(0, 360) // Random angle for explosion
            particle.gravity = gsap.utils.random(200, 400) // less Gravity
            particle.hue = this._isEven(i) ? 186 : 180 // Alternate hues for even/odd particles
            particle.velocity = gsap.utils.random(100, 300) // Velocity for more dynamic explosion

            particle.setStyle();

            this.particles.push(particle);
        }
        return this.particles;
    }

    explode(): gsap.core.Timeline {
        const timeline = gsap.timeline({ paused: true, autoRemoveChildren: true })

        for (const particle of this.particles) {
            const p = particle.getParticle();
            timeline.to(p, {
                duration: 1,
                physics2D: {
                    velocity: particle.velocity,
                    angle: particle.angle,
                    gravity: particle.gravity
                },
                alpha: 0,
                ease: "none",
                onComplete: () => p.remove()
            }, 0); // Start all animations at the same time
        }

        return timeline
    }
}
