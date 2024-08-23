import './index.css';
import ToolboxIcon from './svg/toolbox.svg';

/**
 * Video Embed Tool for Editor.js
 */
export default class VideoEmbed {
  /**
   * Render plugin`s main Element and fill it with saved data
   *
   * @param {{data: VideoEmbedData, config: object, api: object}}
   *   data - previously saved data
   *   config - user config for Tool
   *   api - Editor.js API
   *   readOnly - read-only mode flag
   */
  constructor({ data, config, api, readOnly }) {
    this.api = api;
    this.readOnly = readOnly;
    this.data = {
      url: data.url || '',
      caption: data.caption || '',
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
  }

  /**
   * Get Tool toolbox settings
   * icon - Tool icon's SVG
   * title - title to show in toolbox
   *
   * @returns {{icon: string, title: string}}
   */
  static get toolbox() {
    return {
      icon: ToolboxIcon,
      title: 'Video',
    };
  }

  /**
   * Renders Block content
   * @returns {HTMLDivElement}
   */
  render() {
    const wrapper = this._make('div', [this.CSS.baseClass, this.CSS.wrapper]);

    if (this.data.url) {
      wrapper.appendChild(this._createVideoPreview(this.data.url));
    } else {
      const input = this._make('input', this.CSS.input, {
        placeholder: this.settings.placeholder,
      });

      input.addEventListener('paste', (event) => {
        this._handlePasteEvent(event);
      });

      wrapper.appendChild(input);
    }

    const caption = this._make('div', this.CSS.caption, {
      contentEditable: !this.readOnly,
      innerHTML: this.data.caption || '',
    });
    caption.dataset.placeholder = this.settings.captionPlaceholder;

    wrapper.appendChild(caption);

    return wrapper;
  }

  /**
   * Creates video preview
   * @param {string} url - video URL
   * @returns {HTMLElement}
   */
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
      allowfullscreen: 'true',
    });

    videoWrapper.appendChild(iframe);
    return videoWrapper;
  }

  /**
   * Handle paste event
   * @param {PasteEvent} event - paste event object
   */
  _handlePasteEvent(event) {
    const pastedUrl = event.clipboardData.getData('text');
    const embedInfo = this._getEmbedInfo(pastedUrl);

    if (embedInfo) {
      event.preventDefault();
      this.data.url = pastedUrl;
      const oldElement = event.target;
      const newElement = this._createVideoPreview(pastedUrl);
      oldElement.parentNode.replaceChild(newElement, oldElement);
    }
  }

  /**
   * Extract video ID and create embed URL
   * @param {string} url - video URL
   * @returns {object|null} - object with video info or null if invalid
   */
  _getEmbedInfo(url) {
    const services = [
      {
        regex: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/,
        embedUrl: (id) => `https://www.youtube.com/embed/${id}`,
      },
      {
        regex: /(?:https?:\/\/)?(?:www\.)?rutube\.ru\/video\/([a-zA-Z0-9]+)/,
        embedUrl: (id) => `https://rutube.ru/play/embed/${id}`,
      },
      {
        regex: /(?:https?:\/\/)?(?:www\.)?vk\.com\/video(-?\d+_\d+)/,
        embedUrl: (id) => `https://vk.com/video_ext.php?oid=${id.split('_')[0]}&id=${id.split('_')[1]}&hash=hash`,
      },
    ];

    for (const service of services) {
      const match = url.match(service.regex);
      if (match) {
        return {
          id: match[1],
          embedUrl: service.embedUrl(match[1]),
        };
      }
    }

    return null;
  }

  /**
   * Helper for making Elements with attributes
   * @param  {string} tagName           - new Element tag name
   * @param  {Array|string} classNames  - list or name of CSS class
   * @param  {object} attributes        - any attributes
   * @returns {Element}
   */
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

  /**
   * Return Tool data
   * @returns {VideoEmbedData}
   */
  save(blockContent) {
    const videoWrapper = blockContent.querySelector(`.${this.CSS.videoWrapper}`);
    const caption = blockContent.querySelector(`.${this.CSS.caption}`);

    return Object.assign(this.data, {
      url: videoWrapper ? videoWrapper.querySelector('iframe').src : this.data.url,
      caption: caption ? caption.innerHTML : '',
    });
  }

  /**
   * Validate data: check if Url is correct
   * @param {VideoEmbedData} savedData — data received after saving
   * @returns {boolean} false if saved data is not correct, otherwise true
   */
  validate(savedData) {
    if (!savedData.url.trim()) {
      return false;
    }

    return !!this._getEmbedInfo(savedData.url);
  }

  /**
   * Plugin is ready for i18n translations
   */
  static get isReadOnlySupported() {
    return true;
  }

  /**
   * Get plugin data structure
   * @returns {object}
   */
  static get pasteConfig() {
    return {
      patterns: {
        youtube: /https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([^&]+)/,
        rutube: /https?:\/\/(?:www\.)?rutube\.ru\/video\/([^/]+)/,
        vk: /https?:\/\/(?:www\.)?vk\.com\/video(-?\d+_\d+)/,
      },
    };
  }
}
