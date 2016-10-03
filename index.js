/* jshint node: true */
'use strict';

var Promise   = require('ember-cli/lib/ext/promise');
var path      = require('path');
var fs        = require('fs');

var denodeify = require('rsvp').denodeify;
var readFile  = denodeify(fs.readFile);

var DeployPluginBase = require('ember-cli-deploy-plugin');

module.exports = {
  name: 'ember-cli-deploy-fastly',

  createDeployPlugin: function(options) {
    var Fastly = require('./lib/fastly');

    var DeployPlugin = DeployPluginBase.extend({
      name: options.name,
      defaultConfig: {
        host: 'localhost',
        filePattern: 'index.html',
        distDir: function(context) {
          return context.distDir;
        },
        keyPrefix: function(context){
          return context.project.name() + ':index';
        },
        activationSuffix: 'current',
        activeContentSuffix: 'current-content',
        didDeployMessage: function(context){
          var revisionKey = context.revisionData && context.revisionData.revisionKey;
          var activatedRevisionKey = context.revisionData && context.revisionData.activatedRevisionKey;
          if (revisionKey && !activatedRevisionKey) {
            return "Deployed but did not activate revision " + revisionKey + ". "
                 + "To activate, run: "
                 + "ember deploy:activate " + context.deployTarget + " --revision=" + revisionKey + "\n";
          }
        },
        revisionKey: function(context) {
          return context.commandOptions.revision || (context.revisionData && context.revisionData.revisionKey);
        },
        fastlyDeployClient: function(context) {

          ///
          ///

        },

        revisionData: function(context) {
          return context.revisionData;
        }
      },
      configure: function(/* context */) {
        this.log('validating config', { verbose: true });
        ///

        ///

        ['filePattern', 'distDir', 'keyPrefix', 'activationSuffix', 'activeContentSuffix', 'revisionKey', 'didDeployMessage', 'redisDeployClient', 'maxRecentUploads', 'revisionData'].forEach(this.applyDefaultConfigProperty.bind(this));

        this.log('config ok', { verbose: true });
      },

      upload: function(context) {
        var fastlyDeployClient = this.readConfig('fastlyDeployClient');
        var revisionKey       = this.readConfig('revisionKey');
        var distDir           = this.readConfig('distDir');
        var filePattern       = this.readConfig('filePattern');
        var keyPrefix         = this.readConfig('keyPrefix');
        var maxRecentUploads  = this.readConfig('maxRecentUploads');
        var filePath          = path.join(distDir, filePattern);

        this.log('Uploading `' + filePath + '`', { verbose: true });
        return this._readFileContents(filePath)
          .then(fastlyDeployClient.upload.bind(redisDeployClient, keyPrefix, revisionKey, this.readConfig('revisionData')))
          .then(this._uploadSuccessMessage.bind(this))
          .then(function(key) {
            return { fastlyKey: key };
          })
          .catch(this._errorMessage.bind(this));
      },

      willActivate: function(/* context */) {
        var fastlyDeployClient = this.readConfig('fastlyDeployClient');
        var keyPrefix         = this.readConfig('keyPrefix');

        var revisionKey = redisDeployClient.activeRevision(keyPrefix);

        return {
          revisionData: {
            previousRevisionKey: revisionKey
          }
        };
      },

      activate: function(/* context */) {
        var fastlyDeployClient   = this.readConfig('fastlyDeployClient');
        var revisionKey         = this.readConfig('revisionKey');
        var keyPrefix           = this.readConfig('keyPrefix');
        var activationSuffix    = this.readConfig('activationSuffix');
        var activeContentSuffix = this.readConfig('activeContentSuffix');

        this.log('Activating revision `' + revisionKey + '`', { verbose: true });
        return Promise.resolve(fastlyDeployClient.activate(keyPrefix, revisionKey, activationSuffix, activeContentSuffix))
          .then(this.log.bind(this, '✔ Activated revision `' + revisionKey + '`', {}))
          .then(function(){
            return {
              revisionData: {
                activatedRevisionKey: revisionKey
              }
            };
          })
          .catch(this._errorMessage.bind(this));
      },

      didDeploy: function(/* context */){
        var didDeployMessage = this.readConfig('didDeployMessage');
        if (didDeployMessage) {
          this.log(didDeployMessage);
        }
      },

      fetchInitialRevisions: function(/* context */) {
        var fastlyDeployClient = this.readConfig('fastlyDeployClient');
        var keyPrefix = this.readConfig('keyPrefix');

        this.log('Listing initial revisions for key: `' + keyPrefix + '`', { verbose: true });
        return Promise.resolve(fastlyDeployClient.fetchRevisions(keyPrefix))
          .then(function(revisions) {
            return {
              initialRevisions: revisions
            };
          })
          .catch(this._errorMessage.bind(this));
      },

      fetchRevisions: function(/* context */) {
        var fastlyDeployClient = this.readConfig('fastlyDeployClient');
        var keyPrefix = this.readConfig('keyPrefix');

        this.log('Listing revisions for key: `' + keyPrefix + '`');
        return Promise.resolve(fastlyDeployClient.fetchRevisions(keyPrefix))
          .then(function(revisions) {
            return {
              revisions: revisions
            };
          })
          .catch(this._errorMessage.bind(this));
      },

      _readFileContents: function(path) {
        return readFile(path)
          .then(function(buffer) {
            return buffer.toString();
          });
      },

      _uploadSuccessMessage: function(key) {
        this.log('Uploaded with key `' + key + '`', { verbose: true });
        return Promise.resolve(key);
      },

      _errorMessage: function(error) {
        this.log(error, { color: 'red' });
        return Promise.reject(error);
      }
    });

    return new DeployPlugin();
  }
};
