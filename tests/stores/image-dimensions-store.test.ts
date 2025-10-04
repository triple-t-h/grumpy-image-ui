import { expect } from 'chai'
import { ImageDimensionsStore } from '../../src/core/stores/image-dimensions-store/image-dimensions-store'
import { ImageDimension } from '../../src/core/types'

describe('ImageDimensionsStore Subscription Methods', () => {
    let store: ImageDimensionsStore
    
    // Sample dimension for testing
    const sampleDimension: ImageDimension = {
        aspectRatio: 1.777,
        id: 'test-dimension-1',
        imageFormat: 'jpg',
        filename: 'test-image.jpg',
        height: 1080,
        width: 1920,
        quality: 80
    }

    const sampleDimension2: ImageDimension = {
        aspectRatio: 1.333,
        id: 'test-dimension-2',
        imageFormat: 'png',
        filename: 'test-image-2.png',
        height: 768,
        width: 1024,
        quality: 90
    }

    beforeEach(() => {
        store = new ImageDimensionsStore()
    })

    afterEach(() => {
        store.reset()
    })

    describe('subscribeFromDimension', () => {
        it('should call callback immediately with current resize state (null initially)', (done) => {
            store.subscribeFromDimension((dimension) => {
                expect(dimension).to.be.null
                done()
            })
        })

        it('should call callback when setDimensionState is called', (done) => {
            let callCount = 0
            
            store.subscribeFromDimension((dimension) => {
                callCount++
                
                if (callCount === 1) {
                    // First call should be null (initial state)
                    expect(dimension).to.be.null
                } else if (callCount === 2) {
                    // Second call should have the sample dimension
                    expect(dimension).to.deep.equal(sampleDimension)
                    done()
                }
            })

            // Trigger the callback with a dimension
            store.setDimensionState(sampleDimension)
        })

        it('should handle multiple subscribers', (done) => {
            let subscriber1Called = false
            let subscriber2Called = false

            const checkDone = () => {
                if (subscriber1Called && subscriber2Called) {
                    done()
                }
            }

            store.subscribeFromDimension((dimension) => {
                if (dimension && dimension.id === sampleDimension.id) {
                    subscriber1Called = true
                    checkDone()
                }
            })

            store.subscribeFromDimension((dimension) => {
                if (dimension && dimension.id === sampleDimension.id) {
                    subscriber2Called = true
                    checkDone()
                }
            })

            store.setDimensionState(sampleDimension)
        })

        it('should receive null when setDimensionState is called with null', (done) => {
            let callCount = 0

            store.subscribeFromDimension((dimension) => {
                callCount++
                
                if (callCount === 1) {
                    // First call - initial null state
                    expect(dimension).to.be.null
                } else if (callCount === 2) {
                    // Second call - set to a dimension
                    expect(dimension).to.deep.equal(sampleDimension)
                } else if (callCount === 3) {
                    // Third call - set back to null
                    expect(dimension).to.be.null
                    done()
                }
            })

            store.setDimensionState(sampleDimension)
            store.setDimensionState(null)
        })
    })

    describe('subscribeFromResize', () => {
        it('should call callback immediately with current resize state (null initially)', (done) => {
            store.subscribeFromResize((dimension) => {
                expect(dimension).to.be.null
                done()
            })
        })

        it('should call callback when setResizeState is called', (done) => {
            let callCount = 0
            
            store.subscribeFromResize((dimension) => {
                callCount++
                
                if (callCount === 1) {
                    // First call should be null (initial state)
                    expect(dimension).to.be.null
                } else if (callCount === 2) {
                    // Second call should have the sample dimension
                    expect(dimension).to.deep.equal(sampleDimension)
                    done()
                }
            })

            // Trigger the callback with a dimension
            store.setResizeState(sampleDimension)
        })

        it('should handle multiple subscribers', (done) => {
            let subscriber1Called = false
            let subscriber2Called = false

            const checkDone = () => {
                if (subscriber1Called && subscriber2Called) {
                    done()
                }
            }

            store.subscribeFromResize((dimension) => {
                if (dimension && dimension.id === sampleDimension.id) {
                    subscriber1Called = true
                    checkDone()
                }
            })

            store.subscribeFromResize((dimension) => {
                if (dimension && dimension.id === sampleDimension.id) {
                    subscriber2Called = true
                    checkDone()
                }
            })

            store.setResizeState(sampleDimension)
        })

        it('should receive null when setResizeState is called with null', (done) => {
            let callCount = 0

            store.subscribeFromResize((dimension) => {
                callCount++
                
                if (callCount === 1) {
                    // First call - initial null state
                    expect(dimension).to.be.null
                } else if (callCount === 2) {
                    // Second call - set to a dimension
                    expect(dimension).to.deep.equal(sampleDimension)
                } else if (callCount === 3) {
                    // Third call - set back to null
                    expect(dimension).to.be.null
                    done()
                }
            })

            store.setResizeState(sampleDimension)
            store.setResizeState(null)
        })
    })

    describe('setResizeState', () => {
        it('should update the internal resize state', () => {
            // Subscribe to verify the state change
            let receivedDimension: ImageDimension | null = null

            store.subscribeFromResize((dimension) => {
                receivedDimension = dimension
            })

            // Initial state should be null
            expect(receivedDimension).to.be.null

            // Set resize state
            store.setResizeState(sampleDimension)
            expect(receivedDimension).to.deep.equal(sampleDimension)

            // Set to a different dimension
            store.setResizeState(sampleDimension2)
            expect(receivedDimension).to.deep.equal(sampleDimension2)

            // Set back to null
            store.setResizeState(null)
            expect(receivedDimension).to.be.null
        })

        it('should notify all resize subscribers', () => {
            const receivedDimensions: (ImageDimension | null)[] = []

            // Add multiple subscribers
            store.subscribeFromResize((dimension) => {
                receivedDimensions.push(dimension)
            })

            store.subscribeFromResize((dimension) => {
                receivedDimensions.push(dimension)
            })

            // Set resize state
            store.setResizeState(sampleDimension)

            // Should have 4 calls: 2 initial null calls + 2 dimension calls
            expect(receivedDimensions).to.have.length(4)
            expect(receivedDimensions[0]).to.be.null  // First subscriber initial
            expect(receivedDimensions[1]).to.be.null  // Second subscriber initial
            expect(receivedDimensions[2]).to.deep.equal(sampleDimension)  // First subscriber update
            expect(receivedDimensions[3]).to.deep.equal(sampleDimension)  // Second subscriber update
        })
    })

    describe('setDimensionState', () => {
        it('should update the internal dimension state', () => {
            // Subscribe to verify the state change
            let receivedDimension: ImageDimension | null = null

            store.subscribeFromDimension((dimension) => {
                receivedDimension = dimension
            })

            // Initial state should be null
            expect(receivedDimension).to.be.null

            // Set dimension state
            store.setDimensionState(sampleDimension)
            expect(receivedDimension).to.deep.equal(sampleDimension)

            // Set to a different dimension
            store.setDimensionState(sampleDimension2)
            expect(receivedDimension).to.deep.equal(sampleDimension2)

            // Set back to null
            store.setDimensionState(null)
            expect(receivedDimension).to.be.null
        })

        it('should notify all dimension subscribers', () => {
            const receivedDimensions: (ImageDimension | null)[] = []

            // Add multiple subscribers
            store.subscribeFromDimension((dimension) => {
                receivedDimensions.push(dimension)
            })

            store.subscribeFromDimension((dimension) => {
                receivedDimensions.push(dimension)
            })

            // Set dimension state
            store.setDimensionState(sampleDimension)

            // Should have 4 calls: 2 initial null calls + 2 dimension calls
            expect(receivedDimensions).to.have.length(4)
            expect(receivedDimensions[0]).to.be.null  // First subscriber initial
            expect(receivedDimensions[1]).to.be.null  // Second subscriber initial
            expect(receivedDimensions[2]).to.deep.equal(sampleDimension)  // First subscriber update
            expect(receivedDimensions[3]).to.deep.equal(sampleDimension)  // Second subscriber update
        })
    })

    describe('Integration Tests', () => {
        it('should maintain separate state for resize and dimension subscriptions', () => {
            let resizeReceived: ImageDimension | null = null
            let dimensionReceived: ImageDimension | null = null

            store.subscribeFromResize((dimension) => {
                resizeReceived = dimension
            })

            store.subscribeFromDimension((dimension) => {
                dimensionReceived = dimension
            })

            // Both should start as null
            expect(resizeReceived).to.be.null
            expect(dimensionReceived).to.be.null

            // Set resize state - should only affect resize subscribers
            store.setResizeState(sampleDimension)
            expect(resizeReceived).to.deep.equal(sampleDimension)
            expect(dimensionReceived).to.be.null  // Should remain null

            // Set dimension state - should only affect dimension subscribers
            store.setDimensionState(sampleDimension2)
            expect(resizeReceived).to.deep.equal(sampleDimension)  // Should remain unchanged
            expect(dimensionReceived).to.deep.equal(sampleDimension2)
        })

        it('should handle rapid state changes correctly', () => {
            const resizeUpdates: (ImageDimension | null)[] = []
            const dimensionUpdates: (ImageDimension | null)[] = []

            store.subscribeFromResize((dimension) => {
                resizeUpdates.push(dimension)
            })

            store.subscribeFromDimension((dimension) => {
                dimensionUpdates.push(dimension)
            })

            // Rapid state changes
            store.setResizeState(sampleDimension)
            store.setDimensionState(sampleDimension2)
            store.setResizeState(sampleDimension2)
            store.setDimensionState(null)
            store.setResizeState(null)

            // Verify the sequence of updates
            expect(resizeUpdates).to.have.length(4)  // null, sampleDimension, sampleDimension2, null
            expect(resizeUpdates[0]).to.be.null
            expect(resizeUpdates[1]).to.deep.equal(sampleDimension)
            expect(resizeUpdates[2]).to.deep.equal(sampleDimension2)
            expect(resizeUpdates[3]).to.be.null

            expect(dimensionUpdates).to.have.length(3)  // null, sampleDimension2, null
            expect(dimensionUpdates[0]).to.be.null
            expect(dimensionUpdates[1]).to.deep.equal(sampleDimension2)
            expect(dimensionUpdates[2]).to.be.null
        })
    })
})
