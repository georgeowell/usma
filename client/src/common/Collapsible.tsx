import * as React from 'react';
import * as classNames from 'classnames'

import { Icon } from './Icon'

const transitionTime = 0.25;

export interface CollapsibleProps { className?: string 
                                  , minHeight?: number
                                  , expanded: boolean
                                  , otherExpanding: boolean
                                  , toggle: () => void
                                  , onExpand?: () => void
                                  , onCollapse?: () => void
                                  , onExpanded?: () => void
                                  , onCollapsed?: () => void
                                  , header: () => JSX.Element
                                  }

export class Collapsible extends React.Component<CollapsibleProps, {}> {
  container: React.RefObject<HTMLDivElement>
  minHeight: string;

  constructor(props: CollapsibleProps) {
    super(props)

    this.container = React.createRef();
    this.minHeight = ((props.minHeight || 20) / 4) + 'rem';
  }

  componentDidUpdate(prevProps: CollapsibleProps) {
    if(prevProps.expanded != this.props.expanded) {
      this.animateHeight()
      if(this.props.expanded) {
        if(this.props.onExpand) {
          this.props.onExpand()
        }
      } else {
        if(this.props.onCollapse) {
          this.props.onCollapse()
        }
      }
    }
  }

  componentDidMount() {
    this.animateHeight()
  }

  animateHeight() {
    const el = this.container.current
    if(!el) return

    if(this.props.expanded) {
      el.style.height = el.scrollHeight + 'px';
    } else {
      el.style.height = el.scrollHeight + 'px';
      el.offsetHeight; // trigger reflow
      el.style.height = this.minHeight;
    }
  }

  transitionEnded = () => {
    const el = this.container.current
    if(el) {
      if(this.props.expanded) {
        el.style.height = null;
      }
    }

    if(this.props.expanded) {
      if(this.props.onExpanded) {
        this.props.onExpanded();
      }
    } else {
      if(this.props.onCollapsed) {
        this.props.onCollapsed();
      }
    }
  }

  render() {
    return (
      <div ref={this.container} className={classNames('relative overflow-hidden', this.props.className)} style={{ 
            height: this.minHeight,
            transition: `height ${transitionTime / 2}s ease`,
            transitionDelay: this.props.expanded? '0s' : (this.props.otherExpanding? `${transitionTime / 2}s` : '0s')
          }} onTransitionEnd={this.transitionEnded}>
        <a href="#" onClick={e => { e.preventDefault(); e.stopPropagation(); this.props.toggle() }}
           className="block no-underline text-black hover:text-black hover:no-underline">
           <Icon type={this.props.expanded? 'collapse' : 'expand'} className="w-4 h-4 fill-current absolute pin-r mt-3 mr-2" />
          { this.props.header() }
        </a>
        { this.props.children }
      </div>
    )
  }
}