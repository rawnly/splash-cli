import Unsplash from '../build/extra/Unsplash';

const expressions = {
	PHOTO_ID: /[A-z0-9(-|_|)]+/gi,
	COLLECTION_ID: /[0-9]{3,}/gi,
};

describe( 'Unsplash Client', () => {
	it( 'Get Random Photo', async ( t ) => {
		const photo = await Unsplash.shared.getRandomPhoto();
		const result = expressions.PHOTO_ID.test( photo.id );
		expect( result ).toBe( true );
	}, 1000 );

	it( 'Get Photo Of The Day', async ( t ) => {
		const photo = await Unsplash.shared.picOfTheDay();

		expect( photo.id ).toBeTruthy();
	}, 10000 );

	it( 'Get Collection', async ( t ) => {
		const { id } = await Unsplash.shared.getCollection( 3644553 );

		expect( expressions.COLLECTION_ID.test( `${id}` ) ).toBe( true );
	}, 10000 );

	it( 'Get User', async ( t ) => {
		const username = 'fedevitale';
		const user = await Unsplash.shared.getUser( username );

		expect( user.username ).toBe( username );
		expect( /[A-z0-9]/g.test( user.id ) ).toBe( true );
	} );
} );
