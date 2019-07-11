import path from 'path'

export default (str) => {
    return str
        .split(path.sep)
        .map(str => /\s+/g.test(str) ? `"${str}"` : str)
        .join(path.sep)
}