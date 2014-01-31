(function(global) {
  var isNumber = function(obj) {
    return !isNaN(parseFloat(obj)) && isFinite(obj);
  };

  var isArray = function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  var reduce = function(arr, iterator, memo, context) {
    var initial = arguments.length > 2;
    for(var i = 0; i < arr.length; i++) {
      if (!initial) {
        memo = arr[i];
        initial = true;
      }
      else {
        memo = iterator.call(context, memo, arr[i], i, arr);
      }
    }
    return memo;
  };

  var Classifier = function(options) {
    options = options || {};
    this.storage = options.storage || window.localStorage;
    this.storageKey = options.storageKey || 'classify.js';
    this.reset();
  };

  Classifier.prototype.reset = function() {
    this.trainCount = 0;
    this.setData({
      featureCounts: {},
      labelCounts: {},
      featuresInLabelCounts: {}
    });
  };

  Classifier.prototype.train = function(features, label) {
    if(!isArray(features)) features = [features];
    for(var i = 0; i < features.length; i++) {
      var feature = features[i];
      this.__incrementCount('featureCounts', feature.toString());
      this.__incrementCount('featuresInLabelCounts', feature.toString() + label.toString());
    }
    this.__incrementCount('labelCounts', label.toString(), features.length);
    this.trainCount += features.length;
  };

  Classifier.prototype.classify = function(features) {
    if(!isArray(features)) features = [features];
    var scoresByLabel = {},
        labels = this.__labels();
    for(var i = 0; i < labels.length; i++) {
      var label = labels[i];
      var scores = [];
      for(var j = 0; j < features.length; j++) {
        var feature = features[j];
        var score = this.__probability(feature, label);
        if (isNumber(score) && score > 0) {
          scores.push(score);
        }
      }
      if (scores.length > 0) {
        scoresByLabel[label] = reduce(scores, function(a, b) {
          return a * b;
        });
      }
      else {
        scoresByLabel[label] = 0;
      }
    }
    return scoresByLabel;
  };

  Classifier.prototype.__probability = function(feature, label) {
    var labelCount = this.__labelCount(label),
        featureCount = this.__featureCount(feature),
        featuresInLabelCount = this.__featuresInLabelCount(feature, label);

    return (featuresInLabelCount / labelCount) *
           (labelCount / this.trainCount) /
           (featureCount / this.trainCount);
  };

  Classifier.prototype.__incrementCount = function(countType, key, incrementAmount) {
    incrementAmount = incrementAmount || 1;
    var data = this.getData();
    var currentCount = data[countType][key] || 0;
    data[countType][key] = currentCount + incrementAmount;
    this.setData(data);
  };

  Classifier.prototype.__featureCount = function(feature) {
    return this.getData().featureCounts[feature.toString()] || 0;
  };

  Classifier.prototype.__labelCount = function(label) {
    return this.getData().labelCounts[label.toString()] || 0;
  };

  Classifier.prototype.__featuresInLabelCount = function(feature, label) {
    return this.getData().featuresInLabelCounts[feature.toString()+label.toString()] || 0;
  };

  Classifier.prototype.__labels = function() {
    return Object.keys(this.getData().labelCounts);
  };

  // Override if using custom storage
  Classifier.prototype.getData = function() {
    return JSON.parse(this.storage.getItem(this.storageKey));
  };

  Classifier.prototype.setData = function(modifiedAttributes) {
    var data = this.getData() || {};
    for(var key in modifiedAttributes) {
      data[key] = modifiedAttributes[key];
    }
    return this.storage.setItem(this.storageKey, JSON.stringify(data));
  };

  global.Classifier = Classifier;
})(this);
