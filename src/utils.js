/*
 *  Utilty and convenience methods
 *
 *  Adrian Lange 9/2014
 */

/*
 * true if element is in the array, false if not
 */
function isElementInArray(element, array) {
  for (var i = 0; i < array.length; i++) {
    if (element === array[i]) {
      return true;
    }
  }
  return false;
}

/*
 * Get key for matching path regex, or return not found
 */
var getKeyFromList = function(list, path) {
  for (i=0; i < list.length; i++) {
    if (list[i][0].test(path)) {
      return list[i][1];
    }
  }
  return "NOT_FOUND"
};

exports.isElementInArray = isElementInArray;
exports.getKeyFromList = getKeyFromList;