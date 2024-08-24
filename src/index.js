import './main.css';
import ToolboxIcon from './svg/toolbox.svg';

/**
 * Video Embed Tool for Editor.js
 */
export default class VideoEmbed {
    constructor({data, config, api, readOnly}) {
        this.api = api;
        this.readOnly = readOnly;
        this.data = {
            url: data.url || '',
            caption: data.caption || '',
            service: data.service || '',
        };

        this.CSS = {
            baseClass: this.api.styles.block,
            input: this.api.styles.input,
            wrapper: 'video-embed-tool',
            videoWrapper: 'video-embed-tool__video-wrapper',
            caption: 'video-embed-tool__caption',
        };

        this.settings = {
            placeholder: this.api.i18n.t('Paste a YouTube, RuTube, or VKontakte video URL'),
            captionPlaceholder: this.api.i18n.t('Enter a caption'),
        };

        this.services = [
            {
                name: 'youtube',
                regex: /https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([^&]+)/,
                embedUrl: (id) => `https://www.youtube.com/embed/${id}`,
            },
            {
                name: 'rutube',
                regex: /(?:https?:\/\/)?(?:www\.)?rutube\.ru\/video\/([a-zA-Z0-9]+)\/?.+$/,
                embedUrl: (id) => `https://rutube.ru/play/embed/${id}`,
            },
            {
                name: 'vk',
                regex: /https?:\/\/(?:www\.)?vk\.com\/video(-?\d+_\d+)/,
                embedUrl: (id) => `https://vk.com/video_ext.php?oid=${id.split('_')[0]}&id=${id.split('_')[1]}&hash=hash`,
            },
        ];
    }

    static get toolbox() {
        return {
            icon: '<img src="' + ToolboxIcon.src + '" alt="Video">',
            title: 'Video',
        };
    }

    render() {
        this.wrapper = this._make('div', [this.CSS.baseClass, this.CSS.wrapper]);

        if (this.data.url) {
            this._createVideoPreview(this.data.url);
        } else {
            this._createVideoInput();
        }

        this._createCaption();

        return this.wrapper;
    }

    _createVideoInput() {
        const input = this._make('input', this.CSS.input, {
            placeholder: this.settings.placeholder,
        });

        input.addEventListener('paste', (event) => {
            this._handlePasteEvent(event);
        });

        this.wrapper.appendChild(input);
    }

    _createVideoPreview(url) {
        const embedInfo = this._getEmbedInfo(url);

        if (!embedInfo) {
            return this._make('div', '', {
                textContent: this.api.i18n.t('Invalid video URL'),
            });
        }

        const videoWrapper = this._make('div', this.CSS.videoWrapper);
        const iframe = this._make('iframe', '', {
            src: embedInfo.embedUrl,
            frameborder: '0',
            allowfullscreen: 'allowfullscreen',
        });

        videoWrapper.appendChild(iframe);
        this.wrapper.innerHTML = ''; // Clear the wrapper
        this.wrapper.appendChild(videoWrapper);
    }

    _createCaption() {
        const caption = this._make('div', this.CSS.caption, {
            contentEditable: !this.readOnly,
            innerHTML: this.data.caption || '',
        });
        caption.dataset.placeholder = this.settings.captionPlaceholder;

        this.wrapper.appendChild(caption);
    }

    _handlePasteEvent(event) {
        const pastedData = event.clipboardData.getData('text');
        this._processContent(pastedData);
    }

    _processContent(content) {
        const videoUrls = this._extractVideoUrls(content);

        if (videoUrls.length > 0) {
            // Process the first video URL
            this._processVideoURL(videoUrls[0]);

            // If there are more video URLs, create new blocks for them
            for (let i = 1; i < videoUrls.length; i++) {
                this.api.blocks.insert('videoEmbed', {url: videoUrls[i]});
            }

            // If there's remaining text, create a paragraph block with it
            const remainingText = this._removeVideoUrls(content);
            if (remainingText.trim()) {
                this.api.blocks.insert('paragraph', {text: remainingText.trim()});
            }
        } else {
            // If no video URLs found, create a paragraph block with the content
            this.api.blocks.insert('paragraph', {text: content});
        }
    }

    _extractVideoUrls(content) {
        const urls = [];
        for (const service of this.services) {
            const matches = content.match(new RegExp(service.regex, 'g')) || [];
            urls.push(...matches);
        }
        return urls;
    }

    _removeVideoUrls(content) {
        for (const service of this.services) {
            content = content.replace(new RegExp(service.regex, 'g'), '');
        }
        return content;
    }

    _processVideoURL(url) {
        const embedInfo = this._getEmbedInfo(url);

        if (embedInfo) {
            this.data = {
                url: url,
                service: embedInfo.service,
            };
            this._createVideoPreview(url);
            this._createCaption();
        }
    }

    _getEmbedInfo(url) {
        for (const service of this.services) {
            const match = url.match(service.regex);
            if (match) {
                return {
                    id: match[1],
                    service: service.name,
                    embedUrl: service.embedUrl(match[1]),
                };
            }
        }

        return null;
    }

    _make(tagName, classNames = null, attributes = {}) {
        const el = document.createElement(tagName);

        if (Array.isArray(classNames)) {
            el.classList.add(...classNames);
        } else if (classNames) {
            el.classList.add(classNames);
        }

        for (const attrName in attributes) {
            el[attrName] = attributes[attrName];
        }

        return el;
    }

    save(blockContent) {
        const caption = blockContent.querySelector(`.${this.CSS.caption}`);

        return Object.assign(this.data, {
            caption: caption ? caption.innerHTML : '',
        });
    }

    validate(savedData) {
        if (!savedData.url.trim()) {
            return false;
        }

        return !!this._getEmbedInfo(savedData.url);
    }

    static get isReadOnlySupported() {
        return true;
    }

    onPaste(event) {
        console.log('onPaste', event);
        switch (event.type) {
            case 'pattern':
                const text = event.detail.data;
                this._processContent(text);
                return true;
            case 'tag':
                const iframe = event.detail.data;
                const src = iframe.src;
                this._processVideoURL(src);
                return true;
        }
        return false;
    }

    static get pasteConfig() {
        return {
            patterns: {
                youtube: /https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([^&]+)/i,
                rutube: /(?:https?:\/\/)?(?:www\.)?rutube\.ru\/video\/([a-zA-Z0-9]+)\/?.*$/i,
                vk: /https?:\/\/(?:www\.)?vk\.com\/video(-?\d+_\d+)/i,
            },
            tags: ['iframe'],
        };
    }
}