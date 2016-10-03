var CoreObject = require('core-object');
var Promise    = require('ember-cli/lib/ext/promise');

module.exports = CoreObject.extend({

  init: function(options, lib) {
    ///
    ///
  },

  upload: function(/*keyPrefix, revisionKey, value*/) {
    ///
    ///
  },

  activate: function(keyPrefix, revisionKey, activationSuffix, activeContentSuffix) {
    ///
    ///
  },

  fetchRevisions: function(keyPrefix) {
    ///
    ///
  },

  activeRevision: function(keyPrefix) {
    ///
    ///
  },

  _revisionData: function(keyPrefix, revisions) {
    ///
    ///
  },

  _listRevisions: function(keyPrefix) {
    ///
    ///
  },

  _validateRevisionKey: function(revisionKey, revisions) {
    ///
    ///
  },

  _activateRevisionKey: function(keyPrefix, revisionKey, activationSuffix) {
    ///
    ///
  },

  _activateRevision: function(keyPrefix, revisionKey, activationSuffix, activeContentSuffix) {
    ///
    ///
  },

  _copyRevisionAndActivateRevisionKey: function(keyPrefix, revisionKey, activationSuffix, activeContentSuffix) {
    ///
    ///
  },

  _uploadIfKeyDoesNotExist: function(redisKey, value) {
    ///
    ///
  },

  _uploadRevisionData: function(keyPrefix, revisionKey, revisionData) {
    ///
    ///
  },

  _updateRecentUploadsList: function(keyPrefix, revisionKey) {
    ///
    ///
  },

  _trimRecentUploadsList: function(keyPrefix, maxEntries) {
    ///
    ///
  }
});
