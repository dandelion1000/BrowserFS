import node_process = require('./node_process');
var process = node_process.process;

export class path {
  public static normalize(p: string): string {
    if (p === '') {
      p = '.';
    }
    var absolute = p.charAt(0) === path.sep;
    p = path._removeDuplicateSeps(p);
    var components = p.split(path.sep);
    var goodComponents = [];
    for (var idx = 0; idx < components.length; idx++) {
      var c = components[idx];
      if (c === '.') {
        continue;
      } else if (c === '..' && (absolute || (!absolute && goodComponents.length > 0 && goodComponents[0] !== '..'))) {
        goodComponents.pop();
      } else {
        goodComponents.push(c);
      }
    }

    // @todo Can probably simplify this logic.
    if (!absolute && goodComponents.length < 2) {
      switch (goodComponents.length) {
        case 1:
          if (goodComponents[0] === '') {
            goodComponents.unshift('.');
          }
          break;
        default:
          goodComponents.push('.');
      }
    }
    p = goodComponents.join(path.sep);
    if (absolute && p.charAt(0) !== path.sep) {
      p = path.sep + p;
    }
    return p;
  }

  public static join(...paths: any[]): string {
    var processed = [];
    for (var i = 0; i < paths.length; i++) {
      var segment = paths[i];
      if (typeof segment !== 'string') {
        throw new TypeError("Invalid argument type to path.join: " + (typeof segment));
      } else if (segment !== '') {
        processed.push(segment);
      }
    }
    return path.normalize(processed.join(path.sep));
  }

  public static resolve(...paths: string[]): string {
    var processed = [];
    for (var i = 0; i < paths.length; i++) {
      var p = paths[i];
      if (typeof p !== 'string') {
        throw new TypeError("Invalid argument type to path.join: " + (typeof p));
      } else if (p !== '') {
        if (p.charAt(0) === path.sep) {
          processed = [];
        }
        processed.push(p);
      }
    }
    var resolved = path.normalize(processed.join(path.sep));
    if (resolved.length > 1 && resolved.charAt(resolved.length - 1) === path.sep) {
      return resolved.substr(0, resolved.length - 1);
    }
    if (resolved.charAt(0) !== path.sep) {
      if (resolved.charAt(0) === '.' && (resolved.length === 1 || resolved.charAt(1) === path.sep)) {
        resolved = resolved.length === 1 ? '' : resolved.substr(2);
      }
      var cwd = process.cwd();
      if (resolved !== '') {
        resolved = this.normalize(cwd + (cwd !== '/' ? path.sep : '') + resolved);
      } else {
        resolved = cwd;
      }
    }
    return resolved;
  }

  public static relative(from: string, to: string): string {
    var i;
    from = path.resolve(from);
    to = path.resolve(to);
    var fromSegs = from.split(path.sep);
    var toSegs = to.split(path.sep);
    toSegs.shift();
    fromSegs.shift();
    var upCount = 0;
    var downSegs = [];
    for (i = 0; i < fromSegs.length; i++) {
      var seg = fromSegs[i];
      if (seg === toSegs[i]) {
        continue;
      }
      upCount = fromSegs.length - i;
      break;
    }
    downSegs = toSegs.slice(i);
    if (fromSegs.length === 1 && fromSegs[0] === '') {
      upCount = 0;
    }
    if (upCount > fromSegs.length) {
      upCount = fromSegs.length;
    }
    var rv = '';
    for (i = 0; i < upCount; i++) {
      rv += '../';
    }
    rv += downSegs.join(path.sep);
    if (rv.length > 1 && rv.charAt(rv.length - 1) === path.sep) {
      rv = rv.substr(0, rv.length - 1);
    }
    return rv;
  }

  public static dirname(p: string): string {
    p = path._removeDuplicateSeps(p);
    var absolute = p.charAt(0) === path.sep;
    var sections = p.split(path.sep);
    if (sections.pop() === '' && sections.length > 0) {
      sections.pop();
    }
    if (sections.length > 1) {
      return sections.join(path.sep);
    } else if (absolute) {
      return path.sep;
    } else {
      return '.';
    }
  }

  public static basename(p: string, ext: string = ""): string {
    if (p === '') {
      return p;
    }
    p = path.normalize(p);
    var sections = p.split(path.sep);
    var lastPart = sections[sections.length - 1];
    if (lastPart === '' && sections.length > 1) {
      return sections[sections.length - 2];
    }
    if (ext.length > 0) {
      var lastPartExt = lastPart.substr(lastPart.length - ext.length);
      if (lastPartExt === ext) {
        return lastPart.substr(0, lastPart.length - ext.length);
      }
    }
    return lastPart;
  }

  public static extname(p: string): string {
    p = path.normalize(p);
    var sections = p.split(path.sep);
    p = sections.pop();
    if (p === '' && sections.length > 0) {
      p = sections.pop();
    }
    if (p === '..') {
      return '';
    }
    var i = p.lastIndexOf('.');
    if (i === -1 || i === 0) {
      return '';
    }
    return p.substr(i);
  }

  public static isAbsolute(p: string): boolean {
    return p.length > 0 && p.charAt(0) === path.sep;
  }

  public static _makeLong(p: string): string {
    return p;
  }

  public static sep: string = '/';

  private static _replaceRegex = new RegExp("//+", 'g');

  private static _removeDuplicateSeps(p: string): string {
    p = p.replace(this._replaceRegex, this.sep);
    return p;
  }

  private static delimiter = ':';
}
