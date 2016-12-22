
build: components
	@component build --dev

components:
	@component install --dev

clean:
	rm -fr build components node_modules

all:
	clear
	make clean
	make

test:
	clear
	@./node_modules/.bin/mocha \
		--require should \
		--timeout 10s \
		--slow 3s \
		--bail \
		--reporter spec

testall:
	clear;
	make all;
	npm install;
	make test;

buildtest:
	clear
	make
	make test

.PHONY: clean test all buildtest
