(function(global) {
  var EnglishTextClassifier = function() {
    EnglishTextClassifier.__super__.constructor.apply(this, arguments);
  };
  EnglishTextClassifier = Classifier.extend(EnglishTextClassifier);

  EnglishTextClassifier.prototype.train = function(text, label) {
    return EnglishTextClassifier.__super__.train.call(this, this.__getWords(text), label);
  };

  EnglishTextClassifier.prototype.classify = function(text) {
    return EnglishTextClassifier.__super__.classify.call(this, this.__getWords(text));
  };

  EnglishTextClassifier.prototype.__getWords = function(text) {
    var cleanedText = String(text).replace(/^\s+|\s+$/g, '').toLocaleLowerCase();
    return cleanedText.split(/\W+/);
  };

  global.EnglishTextClassifier = EnglishTextClassifier;
})(this);
