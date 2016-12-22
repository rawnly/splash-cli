var mit_text = 'Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.';



module.exports = function(str){
    if (str.indexOf('MIT') > -1) {
        return 'MIT*';
    } else if (str.indexOf(' mit ') > -1) {
        return 'MIT*';
    } else if (str.indexOf('(mit)') > -1) {
        return 'MIT*';
    } else if (str.indexOf('BSD') > -1) {
        return 'BSD*';
    } else if (str.indexOf('Apache License') > -1) {
        return 'Apache*';
    } else if (str.indexOf('DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE') > -1) {
        return 'WTF*';
    } else if (str.indexOf('BEER-WARE') > -1) {
        return 'BW*';
    } else if (str.indexOf('BEERWARE') > -1) {
        return 'BW*';
    } else if (str.indexOf('Beerware') > -1) {
        return 'BW*';
    } else if (str.indexOf('Beer-ware') > -1) {
        return 'BW*';
    } else if (str.indexOf('Public Domain') > -1) {
        return 'PD*';
    } else if (str.indexOf('PUBLIC DOMAIN') > -1) {
        return 'PD*';
    }
    
    str = str.split("\n");
    str = str.join(' ');
    for (var i=0; i<10; i++) {
        str = str.replace('  ', ' ');
    }
    if (str.indexOf(mit_text) > -1) { // appears to contain MIT license text
        return 'MIT**';
    }
    return null;
}
