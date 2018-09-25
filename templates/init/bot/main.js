import formats from 'newbot-formats'
import code from './main.converse'
import languages from './languages'

import helloSkill from './skills/hello/hello' 

export default {
    code, 
    skills: {
        formats,
        helloSkill
    },
    languages
}