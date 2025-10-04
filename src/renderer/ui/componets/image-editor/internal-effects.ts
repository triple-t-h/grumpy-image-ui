import { gsap } from "gsap";
import log from "loglevel";
import { ParticleField } from "./internal-particle-field";

export class Effects {
    constructor(
        public name: string = '',
        public description: string = '',
        public icon: string = '',
        public isActive: boolean = false,
        public isEnabled: boolean = true
    ) { }

    private _particleField: ParticleField = new ParticleField();

    public get particleField(): ParticleField {
        return this._particleField;
    }

    add(list: HTMLElement, e: PointerEvent): Promise<any> {
        return new Promise((resolve, reject) => {
            // Logic to add the effect
            const q = gsap.utils.selector(list)
                , items = q(`div[data-index]`)
                , finish = () => {
                    // remove class item-fadein for all items
                    items.forEach(item => item.classList.remove('item-fadein'))
                    log.log('Effect added successfully', items)
                }

            if (!items || items.length === 0) {
                reject(-1)
                return
            }

            const clientX = e.clientX
                , clientY = e.clientY
                , lastItem = items[items.length - 1]
                , lastItemRect = lastItem.getBoundingClientRect()
                , lastItemPosition = lastItemRect ? lastItemRect.bottom : 0
                , isClientYBelow = clientY > lastItemPosition

            log.log('Last item position:', { clientY, lastItemPosition, isClientYBelow })

            const relativeX = clientX
                , relativeY = clientY + (isClientYBelow ? lastItemRect.height : 0)
                , particles = this._particleField.pointExplosion(relativeX, relativeY, 55)
                , timeline = gsap.timeline({ paused: true, autoRemoveChildren: true, })

            // timeline.timeScale(.001)

            for (const particle of particles) {
                const p = particle.getParticle()
                document.body.appendChild(p)
            }

            timeline
                .add(this._particleField.explode().restart(), 0)

            timeline.play().then(() => {
                resolve(finish)
            })
        })
    }

    remove(list: HTMLElement, index: number): Promise<number> {
        return new Promise((resolve, reject) => {
            // Logic to remove the effect
            const q = gsap.utils.selector(list)
                , items = q(`div[data-index]`)
                , item = items.find(i => parseInt(i.dataset.index || '-1', 10) === index)
                , itemRect = item?.getBoundingClientRect()
                , listRect = list.getBoundingClientRect()

            if (!item || !itemRect || !listRect) {
                reject(-1)
                return
            }

            // Convert to relative coordinates within the container
            const relativeX = listRect.left
            const relativeY = itemRect.top

            log.log('Relative position:', { relativeX, relativeY })

            // Reduce particle count and make explosion more contained
            const particles = this._particleField.lineExplosion(relativeX, relativeY, itemRect.width, 80)
                , timeline = gsap.timeline({ paused: true, autoRemoveChildren: true, })

            for (const particle of particles) {
                const p = particle.getParticle()
                document.body.appendChild(p)
            }
            log.debug('All particles added to container')

            // timeline.timeScale(.03)

            timeline
                .add(this._particleField.explode().restart(), 0)
                .to(item, {
                    duration: 1,
                    autoAlpha: 0,
                    height: 0,
                    margin: 0,
                    padding: 0,
                    scale: 0,
                    x: -(itemRect.width * 0.33),
                    ease: 'power4.out',
                    onStart: () => {
                        gsap.set(item, { pointerEvents: 'none', border: 'none' })
                    },
                    onComplete: () => {
                        log.debug('Item removal animation completed')                        
                        resolve(index)
                        gsap.set([item], { clearProps: 'all' })
                    }
                }, 0)

            timeline.play()
        })
    }
}