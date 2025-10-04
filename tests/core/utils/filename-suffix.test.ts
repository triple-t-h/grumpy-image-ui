import { expect } from 'chai'
import { ImageDimension } from '../../../src/core/types'
import { addSizeSuffixToFilename, checkFilenameSchema, filenameHasSizeSuffix, removeSizeSuffixFromFilename } from '../../../src/core/utils'

describe('Core Utilities', () => {

    describe('Filename Suffix', () => {

        it('The filename should have a valid suffix.', () => {
            const filename = 'test-1920x1080.jpg'
                , isValid = checkFilenameSchema(filename)
            expect(isValid).to.be.true
        })

        const incorrectImageDimension: ImageDimension = {
            aspectRatio: 0.75,
            id: 'test-id-01',
            imageFormat: 'png',
            filename: 'empire_buecherschrank_frankreich-1500x2000.png',
            height: 2001,
            width: 1501,
            quality: 80
        }

        const correctImageDimension: ImageDimension = {
            aspectRatio: 0.75,
            id: 'test-id-02',
            imageFormat: 'png',
            filename: 'empire_buecherschrank_frankreich-1501x2001.png',
            height: 2001,
            width: 1501,
            quality: 80
        }

        it('The filename suffix should have correct width and height in the filename.', () => {
            const { filename, width, height } = correctImageDimension
                , isValid = filenameHasSizeSuffix(filename, [width, height])
            expect(isValid).to.be.true
        })

        it('The filename suffix must have the wrong width and height in the filename.', () => {
            const { filename, width, height } = incorrectImageDimension
                , isValid = filenameHasSizeSuffix(filename, [width, height])
            expect(isValid).to.be.false
        })

        const fileNameWithSuffix = 'empire_buecherschrank_frankreich-1501x2001.png'
            , fileNameWithoutSuffix = 'empire_buecherschrank_frankreich.png'

        it('Remove size suffix from filename.', () => {
            const newFilename = removeSizeSuffixFromFilename(fileNameWithSuffix)
            expect(newFilename).to.equal(fileNameWithoutSuffix)
        })

        it('Add size suffix to filename.', () => {
            const newFilename = addSizeSuffixToFilename(fileNameWithoutSuffix, [1501, 2001])
            expect(newFilename).to.equal(fileNameWithSuffix)
        })

    })

})
