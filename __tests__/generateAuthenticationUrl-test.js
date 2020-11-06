import { generateAuthenticationURL } from '../build/extra/utils'

describe('generateAuthenticationURL', () => {
	it('Should generate auth url', t => {
		const url = generateAuthenticationURL('public', 'read_user')
		expect( /\&scope=public\+read_user/g.test(url)).toBe(true)
	})
})
