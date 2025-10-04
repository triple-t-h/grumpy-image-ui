// Example usage of the async getOrigin() method

import { getImageDimensionsStoreInstance } from './index'

// Example 1: Using the promise-based getOriginAsync()
async function waitForOrigin() {
    const store = getImageDimensionsStoreInstance()
    
    try {
        // This will either resolve immediately if origin exists,
        // or wait until origin is set by another part of the app
        const origin = await store.getOriginAsync()
        console.log('Origin received:', origin)
        
        // Now you can use the origin for processing
        return origin
    } catch (error) {
        console.error('Failed to get origin:', error)
        return null
    }
}

// Example 2: Check if origin exists immediately, otherwise wait
async function getOriginSmart() {
    const store = getImageDimensionsStoreInstance()
    
    // First try to get it synchronously
    const immediateOrigin = store.getOrigin()
    if (immediateOrigin) {
        console.log('Origin available immediately:', immediateOrigin)
        return immediateOrigin
    }
    
    // If not available, wait for it
    console.log('Origin not available, waiting...')
    const origin = await store.getOriginAsync()
    console.log('Origin received after waiting:', origin)
    return origin
}

// Example 3: Multiple consumers waiting for origin
async function multipleConsumers() {
    const store = getImageDimensionsStoreInstance()
    
    // Multiple parts of the app can wait for the same origin
    const consumer1 = store.getOriginAsync().then(origin => {
        console.log('Consumer 1 got origin:', origin.filename)
    })
    
    const consumer2 = store.getOriginAsync().then(origin => {
        console.log('Consumer 2 got origin:', origin.width + 'x' + origin.height)
    })
    
    const consumer3 = store.getOriginAsync().then(origin => {
        console.log('Consumer 3 got origin ID:', origin.id)
    })
    
    // When setOrigin is called, all three promises will resolve
    await Promise.all([consumer1, consumer2, consumer3])
}

// Example 4: Using getLast() method
function getLastDimensionExample() {
    const store = getImageDimensionsStoreInstance()
    
    // Add some dimensions
    store.add({
        width: 1920, height: 1080, aspectRatio: 1920 / 1080, filename: 'first.jpg',
        imageFormat: ''
    })
    store.add({
        width: 1280, height: 720, aspectRatio: 1280 / 720, filename: 'second.jpg',
        imageFormat: ''
    })
    store.add({
        width: 800, height: 600, aspectRatio: 800 / 600, filename: 'third.jpg',
        imageFormat: ''
    })
    
    // Get the last dimension added
    const lastDimension = store.getLast()
    if (lastDimension) {
        console.log('Last dimension:', lastDimension.filename) // "third.jpg"
    }
    
    // If no dimensions exist, getLast() returns undefined
    store.clear()
    const noLastDimension = store.getLast()
    console.log('No dimensions:', noLastDimension) // undefined
}

// Example 4: Setting origin triggers all waiting promises
function setOriginExample() {
    const store = getImageDimensionsStoreInstance()
    
    // Set up multiple waiting consumers
    store.getOriginAsync().then(origin => console.log('Waiter 1:', origin.filename))
    store.getOriginAsync().then(origin => console.log('Waiter 2:', origin.filename))
    store.getOriginAsync().then(origin => console.log('Waiter 3:', origin.filename))
    
    // This will resolve all waiting promises
    setTimeout(() => {
        store.setOrigin({
            id: 'origin-1',
            filename: 'example.jpg',
            width: 1920,
            height: 1080,
            aspectRatio: 1920 / 1080,
            imageFormat: ''
        })
    }, 1000)
}

export { getLastDimensionExample, getOriginSmart, multipleConsumers, setOriginExample, waitForOrigin }

