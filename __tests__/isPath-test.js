import { isPath } from '../build/extra/utils';

describe( 'isPath', () => {
	it( 'Check if the given string is a path', () => {
		const givenPath = isPath( '~/desktop' );

		expect( givenPath ).toBe( true );
	} );

	it( 'Check if the given string is NOT a path', () => {
		const givenPath = isPath( '~desktop' );

		expect( givenPath ).toBe( false );
	} );
} );
