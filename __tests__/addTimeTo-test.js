import { now, addTimeTo } from '../build/extra/utils';

const milliseconds = 1000 * 60 * 60 * 24; // 24h

describe( 'addTimeTO', () => {
	it( 'Add time to a date', t => {
		const date = now();
		const result = addTimeTo( date, milliseconds );

		expect( result.getTime() ).toBe( date.getTime() + milliseconds );
	} );
} );
