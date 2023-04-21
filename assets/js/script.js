const getSubmenuFrom = item => `<ul> 
    ${Object.keys(item).sort().map( key => {
        const it = item[key];
        let submenu = '';
        if (!!Object.keys(it.sections).length) {
            submenu = getSubmenuFrom(it.sections);
        }
        
        const classes = [
            ... submenu.length > 0 ? ["parent-node"] : [],
            ... it.active ? ["active"] : []
        ];

        return `<li ${classes.length > 0 ? `class="${classes.join(' ')}"`: ''}>
            <a href="/gk-cli${it.url}">${it.name}</a>
            ${submenu}
        </li>`
    }).join('')}
</ul>`;

const sections = pages.reduce((acc, it) => {
    parts = it.name.split(' ');
    let current = acc
    for(let i = 0; i < parts.length; i++) {
        let part = parts[i]
        if ( !current[part] ) {
            current[part] = {
                sections: {}
            }
        }

        if( i == parts.length-1 ){
            current[part] = {
                ... it,
                name: part,
                sections: current[part].sections,
            }
        }

        current = current[part].sections;
    }

    return acc;
}, {});

document.querySelector("#navigation").innerHTML = `<ul><li class="parent-node${sections.gk.active ? " active" : ""}"><a href="/gk-cli${sections.gk.url}">${sections.gk.name}</a></li></ul>`;
document.querySelector("#navigation").innerHTML += getSubmenuFrom(sections.gk.sections)
