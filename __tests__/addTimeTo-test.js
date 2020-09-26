import test from 'ava'
import { now, addTimeTo } from '../build/extra/utils'

const milliseconds = 1000 * 60 * 60 * 24 // 24h

test('Add time to a date', t => {
	const date = now();
	const result = addTimeTo(date, milliseconds)

	t.is(result.getTime(), date.getTime() + milliseconds)
})
