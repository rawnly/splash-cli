import test from 'ava'
import { pathFixer } from '../build/extra/utils'

test('Fix the path', t => {
	const result = pathFixer('~/Desktop')

	t.truthy(result)
	t.is( result.includes('~') , false )
})
