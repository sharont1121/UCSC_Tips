/*
* name: str
* color: css color str
*/
Vue.component('tag', {
    props: ['name', 'color'],
    template: `
    <div class="box has-background-grey p-1 m-1" style="border-radius: 100px;">
        <div class="icon-text">
            <span class="icon" v-bind:style="{backgroundColor: color}" style="border-radius: 100px;"></span>
            <p class="content is-size-7 has-text-white">{{name}}</p>
        </div>
        
    </div>
    `
});