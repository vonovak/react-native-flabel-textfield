//@flow

import React, {Component, PropTypes} from 'react';
import {Platform, StyleSheet, View, TextInput, Animated, AnimatedValue} from 'react-native';

class FloatingLabel extends Component {

    state: {
        paddingAnim: AnimatedValue,
        fontSizeAnim: AnimatedValue,
    }

    constructor(props) {
        super(props);
        let initialPadding = this.props.visible ? this.props.flabelActivePadding : props.flabelPadding
        let initialFontSize = this.props.visible ? props.activeFontSize : props.inactiveFontSize

        this.state = {
            paddingAnim: new Animated.Value(initialPadding),
            fontSizeAnim: new Animated.Value(initialFontSize),
        }
    }

    componentWillReceiveProps(newProps) {
        if (this.props.visible === newProps.visible) {
            return
        }

        Animated.parallel([
            Animated.timing(this.state.paddingAnim, {
                toValue: newProps.visible ? this.props.flabelActivePadding : this.props.flabelPadding,
                duration: this.props.duration,
            }),
            Animated.timing(this.state.fontSizeAnim, {
                toValue: newProps.visible ? this.props.activeFontSize : this.props.inactiveFontSize,
                duration: this.props.duration,
            }),
        ]).start()
    }

    shouldComponentUpdate(newProps, newState) {
        return this.props.visible !== newProps.visible || this.props.focused !== newProps.focused
    }

    render() {
        const labelColor = this.state.paddingAnim.interpolate({
            inputRange: [this.props.flabelActivePadding, this.props.flabelPadding],
            outputRange: [this.props.activeColor, this.props.inactiveColor],
        });

        return (
            <Animated.Text
                style={[styles.floatingLabel, {color: labelColor, top: this.state.paddingAnim},
                !this.props.focused && {color: this.props.inactiveColor}, {fontSize: this.state.fontSizeAnim}]}
            >
                {this.props.placeholder}
            </Animated.Text>
        );
    }
}

export default class FLabelTextField extends Component {

    state: {
        focused: boolean,
    }

    static propTypes = {
        onChangeText: PropTypes.func.isRequired,
        placeholder: PropTypes.string.isRequired,
        duration: PropTypes.number,
        inactiveColor: PropTypes.string,
        inactiveFontSize: PropTypes.number,
        activeFontSize: PropTypes.number,
        activeColor: PropTypes.string,
        flabelPadding: PropTypes.number,
        flabelActivePadding: PropTypes.number,
        wrapperStyle: PropTypes.object,
    }

    static defaultProps = {
        duration: 250,
        inactiveColor: 'dimgrey',
        activeColor: '#414Db1',
        inactiveFontSize: 15,
        activeFontSize: 12,
        flabelPadding: 20,
        flabelActivePadding: 0,
        wrapperStyle: {},
    }

    constructor(props: any) {
        super(props)
        this.state = {
            focused: false,
        }
    }

    render() {
        const visible: boolean = this.state.focused || !!this.props.value

        return (
            <View style={[this.props.wrapperStyle, {flexDirection: 'column'}]}>
                <FloatingLabel
                    visible={visible}
                    focused={this.state.focused}
                    {...this.props}
                />
                <TextInput
                    {...this.props}
                    onFocus={this.setFocus}
                    onBlur={this.unsetFocus}
                    onChangeText={this.props.onChangeText}
                    placeholder=""
                />
            </View>
        );
    }

    setFocus = ()=> {
        this.setState({
            focused: true
        })
        this.props.onFocus && this.props.onFocus()
    }

    unsetFocus = ()=> {
        this.setState({
            focused: false
        })
        this.props.onBlur && this.props.onBlur()
    }
}

const styles = StyleSheet.create({
    floatingLabel: {
        position: 'absolute',
        top: 0,
        ...Platform.select({
            ios: {
                left: 0,
            },
            android: {
                left: 4
            },
        }),
    },
});
