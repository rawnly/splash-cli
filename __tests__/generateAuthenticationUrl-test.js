import test from 'ava'
import { generateAuthenticationURL } from '../build/extra/utils'

test('Should generate auth url', t => {
	const url = generateAuthenticationURL('public', 'read_user')

	t.regex(url, /\&scope=public\+read_user/g, 'Invalid URL')
})
