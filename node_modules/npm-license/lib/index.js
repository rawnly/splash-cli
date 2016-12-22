/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

var UNKNOWN = 'UNKNOWN';
var data = {};
var unversioned = {};
var read = require('read-installed');
var treeify = require('treeify');
var license = require('./license');
var fs = require('fs');
var _ = require('underscore');

var flatten = function(json, options) {
    if (!json.name || !json.version){   // in case dependencies were were empty
        return;
    }
    if (data[json.name + '@' + json.version]){ // prevent circular
        return;
    }

    var moduleInfo = unversioned[json.name] || {licenses: UNKNOWN};
    var moduleId;

    data[json.name + '@' + json.version] = moduleInfo;

    if (!unversioned[json.name]){
        if (json.repository) {
            if (typeof json.repository === 'object') {
                moduleInfo.repository = json.repository.url.replace('git://github.com', 'https://github.com').replace('.git', '');
            }
        }
        if (json.url) {
            if (typeof json.url === 'object') {
                moduleInfo.url = json.url.web;
            }
        }
        var licenseData = json.license || json.licenses || undefined;
        if (json.name === 'uglify-js') console.log(json.path);
        if (licenseData) {
            if (Array.isArray(licenseData) && licenseData.length > 0) {
                moduleInfo.licenses = licenseData.map(function(license){
                    if (typeof license === 'object') {
                        return license.type
                    } else if (typeof license === 'string') {
                        return license;
                    }
                });
            } else if (typeof licenseData === 'object' && licenseData.type) {
                moduleInfo.licenses = licenseData.type;
            } else if (typeof licenseData === 'string') {
                moduleInfo.licenses = licenseData;
            }
        } else if (fs.existsSync(json.path + '/LICENSE')){
            moduleInfo.licenses = license(fs.readFileSync(json.path + '/LICENSE', 'utf8'));
        } else if (fs.existsSync(json.path + '/LICENSE.md')){
            moduleInfo.licenses = license(fs.readFileSync(json.path + '/LICENSE.md', 'utf8'));
        } else if (fs.existsSync(json.path + '/LICENSE.txt')){
            moduleInfo.licenses = license(fs.readFileSync(json.path + '/LICENSE.txt', 'utf8'));
        } else if (json.readme){
            moduleInfo.licenses = license(json.readme) || UNKNOWN;
        } else if (fs.existsSync(json.path + '/README')){
            moduleInfo.licenses = license(fs.readFileSync(json.path + '/README', 'utf8'));
        } else if (fs.existsSync(json.path + '/README.md')){
            moduleInfo.licenses = license(fs.readFileSync(json.path + '/README.md', 'utf8'));
        } else if (fs.existsSync(json.path + '/README.txt')){
            moduleInfo.licenses = license(fs.readFileSync(json.path + '/README.txt', 'utf8'));
        }
    }

    options.include.forEach(function(dependencyType){
        if (json[dependencyType]) {
            Object.keys(json[dependencyType]).forEach(function(moduleName) {
                var childDependency = json[dependencyType][moduleName];
                flatten(childDependency, options);
            });
        }
    });

};

exports.init = function(options, callback) {

    var defaults = {
        start: '.',
        unknown: false,
        depth: 1, 
        include: 'dependencies',
        meta: null
    };

    options = _.extend(defaults, options);
    
    if (typeof options.meta === 'string'){
        var meta = require(process.cwd() + '/' + options.meta);
        var mapToUse = data;
        for (var moduleKey in meta){
            if (moduleKey.indexOf('@') > -1){
                mapToUse = data;
            } else{
                mapToUse = unversioned;
            }
            if (typeof meta[moduleKey] === 'string'){
                mapToUse[moduleKey] = {licenses: meta[moduleKey]};
            }
            else if (typeof meta[moduleKey] === 'object')
                mapToUse[moduleKey] = meta[moduleKey];
        }
    }

    if (typeof options.include === 'string') {
        if (options.include === 'all'){
            options.include = ['dependencies','devDependencies','bundledDependencies','bundleDependencies','optionalDependencies','peerDependencies']
        } else{
            options.include = [options.include]; 
        }
    }

    if (!options.suppress) {
        console.log('scanning', options.start);
    }

    read(options.start, options.depth, function(err, json) {
        flatten(json, options);
        var sorted = {};
        Object.keys(data).sort().forEach(function(item) {
            if (options.unknown) {
                if (data[item].licenses !== UNKNOWN) {
                    if (data[item].licenses.indexOf('*') === -1) {
                       delete data[item];
                    }
                }
            }
            if (data[item]) {
                sorted[item] = data[item];
            }
        });
        callback(sorted);
    });
};

exports.print = function(sorted) {
    console.log(treeify.asTree(sorted, true));
};
