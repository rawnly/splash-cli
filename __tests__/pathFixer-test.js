import { pathFixer } from '../build/extra/utils'

describe('PathFixer', () => {
	it('Fix the path', t => {
		const result = pathFixer('~/Desktop')

		expect(result.includes('~')).toBe(false)
	})
})
