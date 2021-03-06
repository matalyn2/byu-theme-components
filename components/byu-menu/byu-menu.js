"use strict";
import template from "./byu-menu.html";
import * as util from 'byu-web-component-utils';

class BYUMenu extends HTMLElement {

    get showMore() {
        return isShowingMoreMenu(this);
    }

    set showMore(show) {
        const el = this.shadowRoot.querySelector('.byu-menu-more-menu');
        if (show && !isShowingMoreMenu(this)) enableHideClick(this);
        toggleClass(el, 'byu-menu-more-expanded', show);
    }

    constructor() {
        super(); // always call super first
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const component = this;

        util.applyTemplate(this, 'byu-menu', template, () => {
            updateMoreMenuState(this);
            addSlotListeners(this);

            // when the more button is clicked then show the more menu
            this.shadowRoot.querySelector('.byu-menu-more').addEventListener('click', function () {
                component.showMore = true;
            });
        });
    }
}

function addSlotListeners(component) {
    component.shadowRoot.querySelector('slot')
        .addEventListener('slotchange', e => {
            //Run on microtask timing to let polyfilled shadow DOM changes to propagate
            setTimeout(() => updateMoreMenuState(component));
        });
}

function enableHideClick(component) {

    const fn = function () {
        document.removeEventListener('click', fn);
        component.showMore = false;
    };

    setTimeout(function () {
        document.addEventListener('click', fn);
    });
}

function hasClass(el, className) {
    const classes = el.className.split(/ +/);
    return classes.indexOf(className) !== -1;
}

function isShowingMoreMenu(component) {
    return hasClass(component.shadowRoot.querySelector('.byu-menu-more-menu'), 'byu-menu-more-expanded');
}

function toggleClass(el, className, value) {
    const classes = el.className.split(/ +/);
    const index = classes.indexOf(className);
    const exists = index !== -1;
    const setTo = arguments.length > 2 ? arguments[2] : !exists;
    if (setTo && !exists) {
        classes.push(className);
    } else if (!setTo && exists) {
        classes.splice(index, 1);
    }
    el.className = classes.join(' ');
}

function updateMoreMenuState(component) {
    var children = component.shadowRoot.querySelector('.byu-menu-items').assignedNodes();
    var moreChildren = component.shadowRoot.querySelector('.byu-menu-more-slot').assignedNodes();
    var filteredChildren = children.filter(function (node) { return node instanceof HTMLElement });
    var filteredMoreChildren = moreChildren.filter(function (node) { return node instanceof HTMLElement });
    const length = filteredChildren.length + filteredMoreChildren.length;
    const hasOverflow = length > 6;
    const nav = component.shadowRoot.querySelector('.outer-nav');

    if (nav) toggleClass(nav, 'byu-menu-more-visible', hasOverflow);

    if (hasOverflow) {
        for (let i = 5; i < filteredChildren.length; i++) {
            filteredChildren[i].setAttribute('slot', 'more');
        }
    } else if (length === 6) {
        filteredChildren[5].setAttribute('slot', '');
    }

    if (length < 4) {
        component.setAttribute('left-align', '');
    }
    else {
        component.removeAttribute('left-align');
    }

}

window.customElements.define('byu-menu', BYUMenu);
window.BYUMenu = BYUMenu;
