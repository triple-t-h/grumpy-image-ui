import { expect } from 'chai'
import { addSizeSuffixToFilename, removeSizeSuffixFromFilename } from '../../../src/core/utils'

describe('Filename Update Logic', () => {

    describe('Width/Height Change Scenario', () => {

        it('should correctly update filename when width/height changes', () => {
            // Initial filename with size suffix
            const originalFilename = 'empire_buecherschrank_frankreich-1500x2000.png'
            
            // Remove existing suffix
            const baseFilename = removeSizeSuffixFromFilename(originalFilename)
            expect(baseFilename).to.equal('empire_buecherschrank_frankreich.png')
            
            // Add new suffix with updated dimensions
            const newWidth = 1920
            const newHeight = 1080
            const updatedFilename = addSizeSuffixToFilename(baseFilename, [newWidth, newHeight])
            
            expect(updatedFilename).to.equal('empire_buecherschrank_frankreich-1920x1080.png')
        })

        it('should handle filename without existing suffix', () => {
            const originalFilename = 'simple_image.jpg'
            
            // Remove suffix (should return original if no suffix exists)
            const baseFilename = removeSizeSuffixFromFilename(originalFilename)
            expect(baseFilename).to.equal('simple_image.jpg')
            
            // Add new suffix
            const newFilename = addSizeSuffixToFilename(baseFilename, [800, 600])
            expect(newFilename).to.equal('simple_image-800x600.jpg')
        })

        it('should handle multiple size suffix updates', () => {
            let filename = 'test_image.png'
            
            // First update: add initial size
            filename = addSizeSuffixToFilename(filename, [1920, 1080])
            expect(filename).to.equal('test_image-1920x1080.png')
            
            // Second update: change to different size
            const baseFilename = removeSizeSuffixFromFilename(filename)
            filename = addSizeSuffixToFilename(baseFilename, [1280, 720])
            expect(filename).to.equal('test_image-1280x720.png')
            
            // Third update: change to another size
            const baseFilename2 = removeSizeSuffixFromFilename(filename)
            filename = addSizeSuffixToFilename(baseFilename2, [640, 480])
            expect(filename).to.equal('test_image-640x480.png')
        })

    })

})
