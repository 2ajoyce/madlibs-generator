import { extractTemplateFields } from './txt_files'

describe('extractTemplateFields', () => {
    it('extracts fields with question marks correctly', () => {
        const template =
            'Test how {tags} with {question?} marks in them {wo?rk?}'
        const fields = extractTemplateFields(template)
        
        expect(fields).to.have.length(3)
        expect(fields).to.include('tags')
        expect(fields).to.include('question?')
        expect(fields).to.include('wo?rk?')
    })

    it('extracts fields with other punctuation correctly', () => {
        const template = 'Test {field!} and {another$} and {third.}'
        const fields = extractTemplateFields(template)
        
        expect(fields).to.have.length(3)
        expect(fields).to.include('field!')
        expect(fields).to.include('another$')
        expect(fields).to.include('third.')
    })

    it('extracts simple fields correctly', () => {
        const template = 'Once upon a {time}, there was a {person}.'
        const fields = extractTemplateFields(template)
        
        expect(fields).to.have.length(2)
        expect(fields).to.include('time')
        expect(fields).to.include('person')
    })

    it('handles duplicate fields correctly', () => {
        const template = 'The {color} car is {color}.'
        const fields = extractTemplateFields(template)
        
        expect(fields).to.have.length(1)
        expect(fields).to.include('color')
    })

    it('handles empty template correctly', () => {
        const template = ''
        const fields = extractTemplateFields(template)
        
        expect(fields).to.have.length(0)
    })
})
