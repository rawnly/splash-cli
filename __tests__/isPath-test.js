import test from 'ava'
import { isPath } from '../build/extra/utils'

test('Check if the given string is a path', t => {
	const givenPath = isPath('~/desktop')
	t.is(givenPath, true)
})

test('Check if the given string is NOT a path', t => {
	const givenPath = isPath('~desktop')
	t.is(givenPath, false)
})
