import {assign, mapValues, some} from 'lodash'

abstract class NgComponent<Props, State> {

  private __isFirstRender = true

  protected state: State = undefined
  protected props: Props = undefined

  protected abstract render(props: Props, state: State): void

  /*
    eg. {
      as: {currentValue: [1, 2, 3], previousValue: [1, 2]},
      bs: {currentValue: 42, previousValue: undefined}
    }
  */
  // nb: this method is explicity exposed for unit testing
  public $onChanges(changes: {}) {
    const oldProps = mapValues<{}, Props>(changes, 'previousValue')
    const newProps = mapValues<{}, Props>(changes, 'currentValue')

    if (!this.__isFirstRender) {
      this.componentWillReceiveProps(newProps)
    }

    if (this.didPropsChange(newProps, oldProps)) {

      // compute whether we should render or not
      const shouldUpdate = this.shouldComponentUpdate(
        assign({}, this.props, newProps),
        assign({}, this.props, oldProps)
      )

      // store the new props
      this.props = assign({}, this.props, newProps)

      if (shouldUpdate) {

        if (!this.__isFirstRender) {
          this.componentWillUpdate(this.props, this.state)
        }

        this.render(this.props, this.state)

        if (!this.__isFirstRender) {
          this.componentDidUpdate(this.props, this.state)
        }

        this.__isFirstRender = false
      }
    }
  }

  $onInit() {
    this.componentWillMount()
  }

  $postLink() {
    this.componentDidMount()
  }

  $onDestroy() {
    this.componentWillUnmount()
  }

  protected didPropsChange(newProps: Props, oldProps: Props): boolean {
    return some(newProps, (v, k) => v !== oldProps[k])
  }

  /*
    lifecycle hooks
  */

  protected shouldComponentUpdate(newProps: Props, oldProps: Props): boolean {
    return true
  }

  protected componentWillMount() {}
  protected componentDidMount() {}
  protected componentWillReceiveProps(props: Props) {}
  protected componentDidUpdate(props: Props, state: State) {}
  protected componentWillUpdate(props: Props, state: State) {}
  protected componentWillUnmount() {}
}

export default NgComponent