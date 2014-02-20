REPORTER = spec


test-unit:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--globals Fools \

test-w:
  @NODE_ENV=test ./node_modules/.bin/mocha \
    --reporter $(REPORTER) \
    --growl \
    --watch

test: test-unit

.PHONY: test test-w