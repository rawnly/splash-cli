import test from 'ava';
import splashClient from '.';

test('Testing...', async t => {
	try {
		await splashClient([], { version: true });
		t.pass();
	} catch (error) {
		t.fail(error);
	}
})