(function(global) {
  var isNumber = function(obj) {
    return !isNaN(parseFloat(obj)) && isFinite(obj);
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
      categoryCounts: {},
      featuresInCategoryCounts: {}
    });
  };

  Classifier.prototype.train = function(features, category) {
    for(var i = 0; i < features.length; i++) {
      var feature = features[i];
      this.__incrementCount('featureCounts', feature.toString());
      this.__incrementCount('featuresInCategoryCounts', feature.toString() + category.toString());
    }
    this.__incrementCount('categoryCounts', category.toString(), features.length);
    this.trainCount += features.length;
  };

  Classifier.prototype.classify = function(features) {
    var scoresByCategory = {},
        categories = this.__categories();
    for(var i = 0; i < categories.length; i++) {
      var category = categories[i];
      var scores = [];
      for(var j = 0; j < features.length; j++) {
        var feature = features[j];
        var score = this.__probability(feature, category);
        if (isNumber(score) && score > 0) {
          scores.push(score);
        }
      }
      if (scores.length > 0) {
        scoresByCategory[category] = reduce(scores, function(a, b) {
          return a * b;
        });
      }
      else {
        scoresByCategory[category] = 0;
      }
    }
    return scoresByCategory;
  };

  Classifier.prototype.__probability = function(feature, category) {
    var categoryCount = this.__categoryCount(category),
        featureCount = this.__featureCount(feature),
        featuresInCategoryCount = this.__featuresInCategoryCount(feature, category);

    return (featuresInCategoryCount / categoryCount) *
           (categoryCount / this.trainCount) /
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

  Classifier.prototype.__categoryCount = function(category) {
    return this.getData().categoryCounts[category.toString()] || 0;
  };

  Classifier.prototype.__featuresInCategoryCount = function(feature, category) {
    return this.getData().featuresInCategoryCounts[feature.toString()+category.toString()] || 0;
  };

  Classifier.prototype.__categories = function() {
    return Object.keys(this.getData().categoryCounts);
  };

  // Override if using custom storage
  Classifier.prototype.getData = function() {
    return JSON.parse(this.storage.getItem(this.storageKey));
  };

  Classifier.prototype.setData = function(modifiedAttributes) {
    var data = this.getData();
    for(var key in modifiedAttributes) {
      data[key] = modifiedAttributes[key];
    }
    return this.storage.setItem(JSON.stringify(data));
  };

  global.Classifier = Classifier;
})(this);
