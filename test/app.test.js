'use strict';

/* global before, describe, it */

const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');
const assert = require('yeoman-generator').assert;
const helpers = require('yeoman-generator').test;

const libs = require('./libs');
const packageJSON = require('../generators/app/package-json');
const generatorVersion = require('../generators/app/generator-version');

describe('videojs-plugin:app', function() {
  const scripts = [
    'build',
    'clean',
    'lint',
    'start',
    'test',
    'preversion',
    'version',
    'watch'
  ];

  describe('defaults', function() {

    before(function(done) {
      helpers.run(libs.GENERATOR_PATH)
        .withOptions(libs.options())
        .withPrompts({
          name: 'wat',
          author: 'John Doe',
          description: 'wat is the plugin'
        })
        .on('end', () => libs.onEnd(this, done));
    });

    it('sets basic package properties', function() {
      const p = this.pkg;

      assert.strictEqual(p.author, 'John Doe');
      assert.strictEqual(p.license, 'MIT');
      assert.strictEqual(p.name, 'videojs-wat');
      assert.strictEqual(p.description, 'wat is the plugin');
      assert.strictEqual(p.version, '0.0.0');
      assert.strictEqual(p.main, 'dist/videojs-wat.cjs.js');
      assert.strictEqual(p.module, 'dist/videojs-wat.es.js');
      assert.ok(_.isArray(p.keywords));
      assert.ok(_.isPlainObject(p.vjsstandard));
      assert.ok(_.isPlainObject(p.devDependencies));
      assert.strictEqual(p.scripts.prepush, 'npm run lint');
      assert.ok(_.isPlainObject(p['generator-videojs-plugin']));
      assert.strictEqual(p['generator-videojs-plugin'].version, generatorVersion());
    });

    it('has all scripts, even if they are empty', function() {
      libs.allAreNonEmpty(this.pkg.scripts, scripts);
    });

    it('creates common default set of files', function() {
      libs.fileList('common', 'oss').forEach(f => assert.file(f));
    });
  });

  describe('scoped package support', function() {

    before(function(done) {
      helpers.run(libs.GENERATOR_PATH)
        .withOptions(libs.options())
        .withPrompts({
          scope: 'herp',
          name: 'derp',
          author: 'John Doe',
          description: 'it herps and derps'
        })
        .on('end', () => libs.onEnd(this, done));
    });

    it('includes the package name in scope', function() {
      assert.strictEqual(this.pkg.name, '@herp/videojs-derp');
    });
  });

  describe('sass', function() {

    before(function(done) {
      helpers.run(libs.GENERATOR_PATH)
        .withOptions(libs.options())
        .withPrompts({
          name: 'wat',
          author: 'John Doe',
          description: 'wat is the plugin',
          sass: true
        })
        .on('end', () => libs.onEnd(this, done));
    });

    it('populates otherwise empty npm scripts', function() {
      libs.allAreNonEmpty(this.pkg.scripts, scripts.concat([
        'build:css'
      ]));
    });

    it('creates npm-specific and sass-specific files', function() {
      libs.fileList('common', 'oss', 'sass').forEach(f => assert.file(f));
    });
  });

  describe('docs', function() {

    before(function(done) {
      helpers.run(libs.GENERATOR_PATH)
        .withOptions(libs.options())
        .withPrompts({
          name: 'wat',
          author: 'John Doe',
          description: 'wat is the plugin',
          docs: true
        })
        .on('end', () => libs.onEnd(this, done));
    });

    it('populates otherwise empty npm scripts', function() {
      libs.allAreNonEmpty(this.pkg.scripts, scripts.concat([
        'docs',
        'docs:api',
        'docs:toc'
      ]));
    });
  });

  describe('existing package.json with author object', function() {

    before(function(done) {
      helpers.run(libs.GENERATOR_PATH)
        .inTmpDir(function(dir) {
          fs.copySync(path.join(__dirname, '../fixtures/author'), dir);
        })
        .withOptions(libs.options({force: true}))
        .withPrompts({
          name: 'nomen',
          author: 'ignore me',
          description: 'it is a plugin'
        })
        .on('end', () => libs.onEnd(this, done));
    });

    it('does not change the value of the author field', function() {
      const author = this.pkg.author;

      assert.ok(_.isPlainObject(author), 'the author is still an object');

      assert.strictEqual(
        author.name,
        'John Doe',
        'the author\'s name is correct'
      );

      assert.strictEqual(
        author.email,
        'john@doe.com',
        'the author\'s email is correct'
      );
    });
  });

  describe('ie8', function() {
    before(function(done) {
      helpers.run(libs.GENERATOR_PATH)
        .withOptions(libs.options())
        .withPrompts({
          name: 'wat',
          author: 'John Doe',
          description: 'wat is the plugin',
          ie8: true
        })
        .on('end', () => libs.onEnd(this, done));
    });

    it('adds special dependencies for IE8', function() {
      assert.file(['package.json']);

      const pkg = JSON.parse(fs.readFileSync('package.json'), 'utf8');

      assert.ok(
        pkg.devDependencies.hasOwnProperty('babel-preset-es3'),
        'loads es3 preset'
      );

      assert.ok(
        pkg.devDependencies.hasOwnProperty('es5-shim'),
        'loads es5-shim preset'
      );
    });
  });

  describe('no ie8', function() {
    before(function(done) {
      helpers.run(libs.GENERATOR_PATH)
        .withOptions(libs.options())
        .withPrompts({
          name: 'wat',
          author: 'John Doe',
          description: 'wat is the plugin'
        })
        .on('end', () => libs.onEnd(this, done));
    });

    it('does not add special dependencies for IE8', function() {
      assert.file(['package.json']);

      const pkg = JSON.parse(fs.readFileSync('package.json'), 'utf8');

      assert.ok(
        !pkg.devDependencies.hasOwnProperty('babel-preset-es3'),
        'does not load es3 preset'
      );

      assert.ok(
        !pkg.devDependencies.hasOwnProperty('es5-shim'),
        'does not load es5-shim preset'
      );
    });
  });

  describe('husky "none"', function() {
    before(function(done) {
      helpers.run(libs.GENERATOR_PATH)
        .withOptions(libs.options())
        .withPrompts({
          name: 'wat',
          author: 'John Doe',
          description: 'wat is the plugin',
          husky: 'none'
        })
        .on('end', () => libs.onEnd(this, done));
    });

    it('does not cause a failure', function() {
      assert.ok(_.isPlainObject(this.pkg));
      assert.strictEqual(this.pkg.scripts.prepush, undefined);
    });
  });

  describe('package.json merging', function() {
    const result = packageJSON({
      a: 1,
      description: '',
      b: 2,
      name: '',
      c: 3,
      keywords: ['foo', 'bar']
    }, {
      author: 'Jane Doe',
      className: 'vjs-test',
      description: 'This is the description',
      docs: false,
      functionName: 'test',
      isPrivate: false,
      lang: false,
      licenseName: 'MIT',
      packageName: 'videojs-test',
      pluginName: 'test',
      sass: false,
      version: '1.2.3'
    });

    it('overrides properties as expected', function() {
      assert.strictEqual(result.description, 'This is the description');
      assert.strictEqual(result.name, 'videojs-test');
      assert.strictEqual(result.version, '1.2.3');
    });

    it('retains any pre-existing ordering of keys', function() {
      const keys = Object.keys(result);

      assert.strictEqual(keys[0], 'a');
      assert.strictEqual(keys[1], 'description');
      assert.strictEqual(keys[2], 'b');
      assert.strictEqual(keys[3], 'name');
      assert.strictEqual(keys[4], 'c');
      assert.strictEqual(keys[5], 'keywords');
      assert.strictEqual(keys[6], 'version');
      assert.strictEqual(keys[7], 'main');
    });

    it('only adds keywords, does not remove any, and alphabetizes', function() {
      assert.strictEqual(result.keywords[0], 'bar');
      assert.strictEqual(result.keywords[1], 'foo');
      assert.strictEqual(result.keywords[2], 'videojs');
      assert.strictEqual(result.keywords[3], 'videojs-plugin');
    });
  });
});
