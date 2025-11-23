import 'package:flutter/material.dart';
import 'dart:math' as math;
import 'dart:ui' as ui;
import '../../models/campaign.dart';

// Helper class for gradient alignment
class _AlignmentPair {
  final AlignmentGeometry begin;
  final AlignmentGeometry end;

  _AlignmentPair({required this.begin, required this.end});
}

/// 100% Dynamic BottomSheet Renderer - Every Property Configurable
class BottomSheetNudgeRenderer extends StatefulWidget {
  final Campaign campaign;
  final VoidCallback? onDismiss;
  final Function(String action, Map<String, dynamic>? data)? onCTAClick;

  const BottomSheetNudgeRenderer({
    Key? key,
    required this.campaign,
    this.onDismiss,
    this.onCTAClick,
  }) : super(key: key);

  @override
  State<BottomSheetNudgeRenderer> createState() =>
      _BottomSheetNudgeRendererState();
}

class _BottomSheetNudgeRendererState extends State<BottomSheetNudgeRenderer>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  double _dragOffset = 0;

  @override
  void initState() {
    super.initState();
    final config = widget.campaign.config;

    _controller = AnimationController(
      vsync: this,
      duration:
          Duration(milliseconds: _getInt(config, 'animationDuration', 300)),
    );

    // DYNAMIC ANIMATION CURVE
    final animationCurve = _parseAnimationCurve(config['animationCurve']);
    _animation = CurvedAnimation(
      parent: _controller,
      curve: animationCurve,
    );

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _handleDismiss() async {
    await _controller.reverse();
    widget.onDismiss?.call();
  }

  void _handleCTA(String action) {
    widget.onCTAClick?.call(action, widget.campaign.config);
    if (_getBool(widget.campaign.config, 'autoDismissOnCTA', true)) {
      _handleDismiss();
    }
  }

  void _handleDragUpdate(DragUpdateDetails details) {
    setState(() {
      _dragOffset += details.delta.dy;
      if (_dragOffset < 0) _dragOffset = 0;
      final screenHeight = MediaQuery.of(context).size.height;
      _controller.value = 1.0 - (_dragOffset / screenHeight).clamp(0.0, 1.0);
    });
  }

  void _handleDragEnd(DragEndDetails details) {
    final config = widget.campaign.config;
    final screenHeight = MediaQuery.of(context).size.height;
    final dismissThreshold = _getDouble(config, 'dismissThreshold', 0.15);

    if (_dragOffset > screenHeight * dismissThreshold ||
        details.velocity.pixelsPerSecond.dy > 600) {
      _handleDismiss();
    } else {
      setState(() => _dragOffset = 0);
      _controller.forward();
    }
  }

  @override
  Widget build(BuildContext context) {
    final config = widget.campaign.config;
    final dismissible = _getBool(config, 'dismissible', true);
    final backdropDismiss = _getBool(config, 'backdropDismiss', true);
    final backdropOpacity = _getDouble(config, 'overlayOpacity', 0.4);
    final backdropColor = _parseColor(config['backdropColor']) ?? Colors.black;
    final animationType = config['animationType']?.toString() ?? 'slide';

    return WillPopScope(
      onWillPop: () async {
        if (dismissible) {
          await _handleDismiss();
          return false;
        }
        return false;
      },
      child: GestureDetector(
        onTap: (dismissible && backdropDismiss) ? _handleDismiss : null,
        behavior: HitTestBehavior.opaque,
        child: Material(
          color: backdropColor.withOpacity(backdropOpacity),
          child: Align(
            alignment: Alignment.bottomCenter,
            child: _buildAnimatedTransition(
              animationType,
              GestureDetector(
                onTap: () {},
                onVerticalDragUpdate: dismissible ? _handleDragUpdate : null,
                onVerticalDragEnd: dismissible ? _handleDragEnd : null,
                child: _buildSheet(context, config),
              ),
            ),
          ),
        ),
      ),
    );
  }

  // NEW: Dynamic animation type builder
  Widget _buildAnimatedTransition(String animationType, Widget child) {
    switch (animationType.toLowerCase()) {
      case 'fade':
        return FadeTransition(
          opacity: _animation,
          child: child,
        );
      case 'scale':
        return ScaleTransition(
          scale: _animation,
          child: child,
        );
      case 'slide':
      default:
        return SlideTransition(
          position: Tween<Offset>(
            begin: const Offset(0, 1),
            end: Offset.zero,
          ).animate(_animation),
          child: child,
        );
    }
  }

  Widget _buildSheet(BuildContext context, Map<String, dynamic> config) {
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;

    // DYNAMIC SIZING
    final width = _getDouble(config, 'width', screenWidth);
    final maxHeight = _getDouble(config, 'maxHeight', screenHeight * 0.85);
    final minHeight = _getDouble(config, 'minHeight', 0);

    // DYNAMIC BACKGROUND
    final backgroundColor =
        _parseColor(config['backgroundColor']) ?? Colors.white;
    final backgroundGradient = config['backgroundGradient'];
    final backgroundImage = config['backgroundImage'];
    final mode = config['mode']?.toString();

    // DYNAMIC BORDER
    final borderColor = _parseColor(config['borderColor']);
    final borderWidth = _getDouble(config, 'borderWidth', 0);
    final borderStyle = config['borderStyle']?.toString() ?? 'solid';

    // DYNAMIC BORDER RADIUS (per corner)
    final borderRadius = _getDouble(config, 'borderRadius', 20);
    final borderRadiusTopLeft =
        _getDouble(config, 'borderRadiusTopLeft', borderRadius);
    final borderRadiusTopRight =
        _getDouble(config, 'borderRadiusTopRight', borderRadius);
    final borderRadiusBottomLeft =
        _getDouble(config, 'borderRadiusBottomLeft', 0);
    final borderRadiusBottomRight =
        _getDouble(config, 'borderRadiusBottomRight', 0);

    // DYNAMIC SHADOW
    final shadowColor = _parseColor(config['shadowColor']) ?? Colors.black;
    final shadowOpacity = _getDouble(config, 'shadowOpacity', 0.1);
    final shadowBlur = _getDouble(config, 'shadowBlur', 16);
    final shadowSpread = _getDouble(config, 'shadowSpread', 0);
    final shadowOffsetX = _getDouble(config, 'shadowOffsetX', 0);
    final shadowOffsetY = _getDouble(config, 'shadowOffsetY', -2);

    // DYNAMIC PADDING
    final paddingTop = _getDouble(config, 'paddingTop', 0);
    final paddingBottom = _getDouble(config, 'paddingBottom', 0);
    final paddingLeft = _getDouble(config, 'paddingLeft', 0);
    final paddingRight = _getDouble(config, 'paddingRight', 0);

    // BACKDROP BLUR & OPACITY
    final backdropBlur = _getDouble(config, 'backdropBlur', 0);
    final containerOpacity = _getDouble(config, 'containerOpacity', 1.0);

    // CONTAINER TRANSFORM (translateX, translateY, rotate, scale)
    final containerTranslateX = _getDouble(config, 'containerTranslateX', 0);
    final containerTranslateY = _getDouble(config, 'containerTranslateY', 0);
    final containerRotate = _getDouble(config, 'containerRotate', 0);
    final containerScale = _getDouble(config, 'containerScale', 1.0);

    Widget sheetContent = Container(
      width: width,
      constraints: BoxConstraints(
        maxHeight: maxHeight,
        minHeight: minHeight,
      ),
      padding: EdgeInsets.fromLTRB(
          paddingLeft, paddingTop, paddingRight, paddingBottom),
      decoration: BoxDecoration(
        color: mode == 'image-only' ? Colors.transparent : backgroundColor,
        gradient: backgroundGradient != null
            ? _parseGradient(backgroundGradient)
            : null,
        image: mode == 'image-only' && config['backgroundImageUrl'] != null
            ? DecorationImage(
                image: NetworkImage(config['backgroundImageUrl'].toString()),
                fit: _parseBoxFit(config['backgroundSize']),
              )
            : backgroundImage != null
                ? _parseBackgroundImage(backgroundImage, config)
                : null,
        border: borderColor != null && borderWidth > 0 && borderStyle == 'solid'
            ? Border.all(
                color: borderColor,
                width: borderWidth,
                style: BorderStyle.solid,
              )
            : null,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(borderRadiusTopLeft),
          topRight: Radius.circular(borderRadiusTopRight),
          bottomLeft: Radius.circular(borderRadiusBottomLeft),
          bottomRight: Radius.circular(borderRadiusBottomRight),
        ),
        boxShadow: shadowBlur > 0 || shadowSpread > 0
            ? [
                BoxShadow(
                  color: shadowColor.withOpacity(shadowOpacity),
                  blurRadius: shadowBlur,
                  spreadRadius: shadowSpread,
                  offset: Offset(shadowOffsetX, shadowOffsetY),
                ),
              ]
            : null,
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildDragHandle(config),
            Flexible(child: _buildContent(context, config)),
          ],
        ),
      ),
    );

    // Apply backdrop blur if specified
    if (backdropBlur > 0) {
      sheetContent = ClipRRect(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(borderRadiusTopLeft),
          topRight: Radius.circular(borderRadiusTopRight),
          bottomLeft: Radius.circular(borderRadiusBottomLeft),
          bottomRight: Radius.circular(borderRadiusBottomRight),
        ),
        child: BackdropFilter(
          filter:
              ui.ImageFilter.blur(sigmaX: backdropBlur, sigmaY: backdropBlur),
          child: sheetContent,
        ),
      );
    }

    // Apply dashed/dotted border if specified (not supported natively by BoxDecoration)
    if (borderColor != null &&
        borderWidth > 0 &&
        (borderStyle == 'dashed' || borderStyle == 'dotted')) {
      sheetContent = CustomPaint(
        painter: DashedBorderPainter(
          color: borderColor,
          width: borderWidth,
          style: borderStyle,
          borderRadius: borderRadiusTopLeft, // Using top-left as reference
        ),
        child: sheetContent,
      );
    }

    // Apply container opacity if specified
    if (containerOpacity < 1.0) {
      sheetContent = Opacity(
        opacity: containerOpacity,
        child: sheetContent,
      );
    }

    // Apply container transform if specified (translateX, translateY, rotate, scale)
    if (containerTranslateX != 0 ||
        containerTranslateY != 0 ||
        containerRotate != 0 ||
        containerScale != 1.0) {
      sheetContent = Transform(
        transform: Matrix4.identity()
          ..translate(containerTranslateX, containerTranslateY)
          ..rotateZ(containerRotate *
              3.14159265359 /
              180) // Convert degrees to radians
          ..scale(containerScale),
        alignment: Alignment.center,
        child: sheetContent,
      );
    }

    return sheetContent;
  }

  Widget _buildDragHandle(Map<String, dynamic> config) {
    final showDragHandle = _getBool(config, 'dragHandle', true);
    if (!showDragHandle) return const SizedBox.shrink();

    // DYNAMIC DRAG HANDLE
    final handleWidth = _getDouble(config, 'dragHandleWidth', 32);
    final handleHeight = _getDouble(config, 'dragHandleHeight', 3);
    final handleColor =
        _parseColor(config['dragHandleColor']) ?? const Color(0xFFE0E0E0);
    final handleBorderRadius =
        _getDouble(config, 'dragHandleBorderRadius', 1.5);
    final handleMarginTop = _getDouble(config, 'dragHandleMarginTop', 10);
    final handleMarginBottom = _getDouble(config, 'dragHandleMarginBottom', 4);
    final handleOpacity = _getDouble(config, 'dragHandleOpacity', 1.0);

    final handle = Container(
      margin: EdgeInsets.only(top: handleMarginTop, bottom: handleMarginBottom),
      width: handleWidth,
      height: handleHeight,
      decoration: BoxDecoration(
        color: handleColor,
        borderRadius: BorderRadius.circular(handleBorderRadius),
      ),
    );

    return handleOpacity < 1.0
        ? Opacity(opacity: handleOpacity, child: handle)
        : handle;
  }

  Widget _buildContent(BuildContext context, Map<String, dynamic> config) {
    final scrollable = _getBool(config, 'scrollable', false);

    // DYNAMIC CONTENT PADDING
    final contentPaddingTop = _getDouble(config, 'contentPaddingTop', 12);
    final contentPaddingBottom = _getDouble(config, 'contentPaddingBottom', 20);
    final contentPaddingLeft = _getDouble(config, 'contentPaddingLeft', 20);
    final contentPaddingRight = _getDouble(config, 'contentPaddingRight', 20);

    final content = Padding(
      padding: EdgeInsets.fromLTRB(
        contentPaddingLeft,
        contentPaddingTop,
        contentPaddingRight,
        contentPaddingBottom,
      ),
      child: Stack(
        children: [
          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              _buildImage(config),
              _buildTitle(config),
              _buildSubtitle(config),
              _buildText(config),
              _buildButtons(config),
            ],
          ),
          _buildCloseButton(config),
          ..._buildIcons(config),
        ],
      ),
    );

    return scrollable
        ? SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: content,
          )
        : content;
  }

  Widget _buildImage(Map<String, dynamic> config) {
    final imageUrl = config['imageUrl']?.toString();
    if (imageUrl == null || imageUrl.isEmpty) return const SizedBox.shrink();

    // DYNAMIC IMAGE PROPERTIES
    final imageWidth = _getDouble(config, 'imageWidth', 56);
    final imageHeight = _getDouble(config, 'imageHeight', 56);
    final imageFit = _parseBoxFit(config['imageFit']);
    final imageBorderRadius = _getDouble(config, 'imageBorderRadius', 8);
    final imageMarginTop = _getDouble(config, 'imageMarginTop', 0);
    final imageMarginBottom = _getDouble(config, 'imageMarginBottom', 16);
    final imageMarginLeft = _getDouble(config, 'imageMarginLeft', 0);
    final imageMarginRight = _getDouble(config, 'imageMarginRight', 0);
    final imageOpacity = _getDouble(config, 'imageOpacity', 1.0);

    // DYNAMIC IMAGE BORDER
    final imageBorderColor = _parseColor(config['imageBorderColor']);
    final imageBorderWidth = _getDouble(config, 'imageBorderWidth', 0);

    // DYNAMIC IMAGE SHADOW
    final imageShadowColor = _parseColor(config['imageShadowColor']);
    final imageShadowOpacity = _getDouble(config, 'imageShadowOpacity', 0);
    final imageShadowBlur = _getDouble(config, 'imageShadowBlur', 0);
    final imageShadowSpread = _getDouble(config, 'imageShadowSpread', 0);
    final imageShadowOffsetX = _getDouble(config, 'imageShadowOffsetX', 0);
    final imageShadowOffsetY = _getDouble(config, 'imageShadowOffsetY', 0);

    return Container(
      margin: EdgeInsets.fromLTRB(
        imageMarginLeft,
        imageMarginTop,
        imageMarginRight,
        imageMarginBottom,
      ),
      decoration: BoxDecoration(
        border: imageBorderColor != null && imageBorderWidth > 0
            ? Border.all(color: imageBorderColor, width: imageBorderWidth)
            : null,
        borderRadius: BorderRadius.circular(imageBorderRadius),
        boxShadow: imageShadowBlur > 0 && imageShadowColor != null
            ? [
                BoxShadow(
                  color: imageShadowColor.withOpacity(imageShadowOpacity),
                  blurRadius: imageShadowBlur,
                  spreadRadius: imageShadowSpread,
                  offset: Offset(imageShadowOffsetX, imageShadowOffsetY),
                ),
              ]
            : null,
      ),
      child: Opacity(
        opacity: imageOpacity,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(imageBorderRadius),
          child: Image.network(
            imageUrl,
            width: imageWidth,
            height: imageHeight,
            fit: imageFit,
            errorBuilder: (_, __, ___) => Container(
              width: imageWidth,
              height: imageHeight,
              color: const Color(0xFFF5F5F5),
              child: Icon(
                Icons.image_outlined,
                size: imageWidth * 0.4,
                color: Colors.grey[400],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTitle(Map<String, dynamic> config) {
    final title = config['title']?.toString();
    if (title == null || title.isEmpty) return const SizedBox.shrink();

    // DYNAMIC TITLE STYLING
    final titleFontSize = _getDouble(config, 'titleFontSize', 22);
    final titleFontWeight = _parseFontWeight(config['titleFontWeight']);
    final titleColor = _parseColor(config['titleColor']) ??
        _parseColor(config['textColor']) ??
        Colors.black;
    final titleLineHeight = _getDouble(config, 'titleLineHeight', 1.2);
    final titleLetterSpacing = _getDouble(config, 'titleLetterSpacing', -0.3);
    final titleAlign = _parseTextAlign(config['titleAlign']);
    final titleMarginBottom = _getDouble(config, 'titleMarginBottom', 12);

    // TITLE DECORATION & EFFECTS
    final titleDecoration = _parseTextDecoration(config['titleDecoration']);
    final titleDecorationColor = _parseColor(config['titleDecorationColor']);
    final titleDecorationStyle =
        _parseTextDecorationStyle(config['titleDecorationStyle']);
    final titleFontStyle = _parseFontStyle(config['titleFontStyle']);
    final titleTransform = config['titleTextTransform']?.toString();

    // TITLE SHADOW
    final titleShadowColor = _parseColor(config['titleShadowColor']);
    final titleShadowBlur = _getDouble(config, 'titleShadowBlur', 0);
    final titleShadowOffsetX = _getDouble(config, 'titleShadowOffsetX', 0);
    final titleShadowOffsetY = _getDouble(config, 'titleShadowOffsetY', 0);

    // TITLE TRANSFORM (translateX, translateY, rotate, scale)
    final titleTranslateX = _getDouble(config, 'titleTranslateX', 0);
    final titleTranslateY = _getDouble(config, 'titleTranslateY', 0);
    final titleRotate = _getDouble(config, 'titleRotate', 0);
    final titleScale = _getDouble(config, 'titleScale', 1.0);

    Widget titleWidget = Text(
      _applyTextTransform(title, titleTransform),
      textAlign: titleAlign,
      style: TextStyle(
        fontSize: titleFontSize,
        fontWeight: titleFontWeight,
        color: titleColor,
        height: titleLineHeight,
        letterSpacing: titleLetterSpacing,
        decoration: titleDecoration,
        decorationColor: titleDecorationColor,
        decorationStyle: titleDecorationStyle,
        fontStyle: titleFontStyle,
        shadows: titleShadowColor != null && titleShadowBlur > 0
            ? [
                Shadow(
                  color: titleShadowColor,
                  blurRadius: titleShadowBlur,
                  offset: Offset(titleShadowOffsetX, titleShadowOffsetY),
                ),
              ]
            : null,
      ),
    );

    // Apply transform if specified
    if (titleTranslateX != 0 ||
        titleTranslateY != 0 ||
        titleRotate != 0 ||
        titleScale != 1.0) {
      titleWidget = Transform(
        transform: Matrix4.identity()
          ..translate(titleTranslateX, titleTranslateY)
          ..rotateZ(titleRotate * 3.14159265359 / 180)
          ..scale(titleScale),
        alignment: Alignment.center,
        child: titleWidget,
      );
    }

    return Container(
      margin: EdgeInsets.only(bottom: titleMarginBottom),
      child: titleWidget,
    );
  }

  Widget _buildSubtitle(Map<String, dynamic> config) {
    final subtitle = config['subtitle']?.toString();
    if (subtitle == null || subtitle.isEmpty) return const SizedBox.shrink();

    // DYNAMIC SUBTITLE STYLING
    final subtitleFontSize = _getDouble(config, 'subtitleFontSize', 16);
    final subtitleFontWeight = _parseFontWeight(config['subtitleFontWeight']);
    final subtitleColor = _parseColor(config['subtitleColor']) ??
        _parseColor(config['textColor']) ??
        Colors.black87;
    final subtitleLineHeight = _getDouble(config, 'subtitleLineHeight', 1.3);
    final subtitleLetterSpacing =
        _getDouble(config, 'subtitleLetterSpacing', -0.2);
    final subtitleAlign = _parseTextAlign(config['subtitleAlign']);
    final subtitleMarginBottom = _getDouble(config, 'subtitleMarginBottom', 8);

    // SUBTITLE DECORATION & EFFECTS
    final subtitleDecoration =
        _parseTextDecoration(config['subtitleDecoration']);
    final subtitleDecorationColor =
        _parseColor(config['subtitleDecorationColor']);
    final subtitleFontStyle = _parseFontStyle(config['subtitleFontStyle']);
    final subtitleTransform = config['subtitleTextTransform']?.toString();

    // SUBTITLE SHADOW
    final subtitleShadowColor = _parseColor(config['subtitleShadowColor']);
    final subtitleShadowBlur = _getDouble(config, 'subtitleShadowBlur', 0);
    final subtitleShadowOffsetX =
        _getDouble(config, 'subtitleShadowOffsetX', 0);
    final subtitleShadowOffsetY =
        _getDouble(config, 'subtitleShadowOffsetY', 0);

    return Container(
      margin: EdgeInsets.only(bottom: subtitleMarginBottom),
      child: Text(
        _applyTextTransform(subtitle, subtitleTransform),
        textAlign: subtitleAlign,
        style: TextStyle(
          fontSize: subtitleFontSize,
          fontWeight: subtitleFontWeight,
          color: subtitleColor,
          height: subtitleLineHeight,
          letterSpacing: subtitleLetterSpacing,
          decoration: subtitleDecoration,
          decorationColor: subtitleDecorationColor,
          fontStyle: subtitleFontStyle,
          shadows: subtitleShadowColor != null && subtitleShadowBlur > 0
              ? [
                  Shadow(
                    color: subtitleShadowColor,
                    blurRadius: subtitleShadowBlur,
                    offset:
                        Offset(subtitleShadowOffsetX, subtitleShadowOffsetY),
                  ),
                ]
              : null,
        ),
      ),
    );
  }

  Widget _buildText(Map<String, dynamic> config) {
    final text = config['text']?.toString();
    if (text == null || text.isEmpty) return const SizedBox.shrink();

    // DYNAMIC TEXT STYLING
    final fontSize = _getDouble(config, 'fontSize', 17);
    final fontWeight = _parseFontWeight(config['fontWeight']);
    final textColor = _parseColor(config['textColor']) ?? Colors.black;
    final lineHeight = _getDouble(config, 'lineHeight', 1.35);
    final letterSpacing = _getDouble(config, 'letterSpacing', -0.2);
    final textAlign = _parseTextAlign(config['textAlign']);
    final textMarginBottom = _getDouble(config, 'textMarginBottom', 20);

    // TEXT DECORATION & EFFECTS
    final textDecoration = _parseTextDecoration(config['textDecoration']);
    final textDecorationColor = _parseColor(config['textDecorationColor']);
    final textFontStyle = _parseFontStyle(config['fontStyle']);
    final textTransform = config['textTransform']?.toString();

    // TEXT SHADOW
    final textShadowColor = _parseColor(config['textShadowColor']);
    final textShadowBlur = _getDouble(config, 'textShadowBlur', 0);
    final textShadowOffsetX = _getDouble(config, 'textShadowOffsetX', 0);
    final textShadowOffsetY = _getDouble(config, 'textShadowOffsetY', 0);

    return Container(
      margin: EdgeInsets.only(bottom: textMarginBottom),
      child: Text(
        _applyTextTransform(text, textTransform),
        textAlign: textAlign,
        style: TextStyle(
          fontSize: fontSize,
          fontWeight: fontWeight,
          color: textColor,
          height: lineHeight,
          letterSpacing: letterSpacing,
          decoration: textDecoration,
          decorationColor: textDecorationColor,
          fontStyle: textFontStyle,
          shadows: textShadowColor != null && textShadowBlur > 0
              ? [
                  Shadow(
                    color: textShadowColor,
                    blurRadius: textShadowBlur,
                    offset: Offset(textShadowOffsetX, textShadowOffsetY),
                  ),
                ]
              : null,
        ),
      ),
    );
  }

  Widget _buildButtons(Map<String, dynamic> config) {
    final buttonText = config['buttonText']?.toString();
    final secondaryButtonText = config['secondaryButtonText']?.toString();

    if (buttonText == null && secondaryButtonText == null) {
      return const SizedBox.shrink();
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (buttonText != null) _buildPrimaryButton(config, buttonText),
        if (secondaryButtonText != null) ...[
          SizedBox(height: _getDouble(config, 'secondaryButtonMarginTop', 12)),
          _buildSecondaryButton(config, secondaryButtonText),
        ],
      ],
    );
  }

  Widget _buildPrimaryButton(Map<String, dynamic> config, String text) {
    // DYNAMIC BUTTON STYLING
    final buttonHeight = _getDouble(config, 'buttonHeight', 50);
    final buttonColor =
        _parseColor(config['buttonColor']) ?? const Color(0xFF4CAF50);
    final buttonTextColor =
        _parseColor(config['buttonTextColor']) ?? Colors.white;
    final buttonFontSize = _getDouble(config, 'buttonFontSize', 16);
    final buttonFontWeight = _parseFontWeight(config['buttonFontWeight']);
    final buttonBorderRadius = _getDouble(config, 'buttonBorderRadius', 12);
    final buttonElevation = _getDouble(config, 'buttonElevation', 0);

    // DYNAMIC BUTTON BORDER
    final buttonBorderColor = _parseColor(config['buttonBorderColor']);
    final buttonBorderWidth = _getDouble(config, 'buttonBorderWidth', 0);

    // BUTTON ADVANCED STYLING
    final buttonPaddingVertical =
        _getDouble(config, 'buttonPaddingVertical', 0);
    final buttonPaddingHorizontal =
        _getDouble(config, 'buttonPaddingHorizontal', 0);
    final buttonLetterSpacing = _getDouble(config, 'buttonLetterSpacing', 0);
    final buttonWidth = config['buttonWidth'];
    final buttonTextTransform = config['buttonTextTransform']?.toString();

    // BUTTON SHADOW
    final buttonShadowColor = _parseColor(config['buttonShadowColor']);
    final buttonShadowBlur = _getDouble(config, 'buttonShadowBlur', 0);
    final buttonShadowSpread = _getDouble(config, 'buttonShadowSpread', 0);
    final buttonShadowOffsetX = _getDouble(config, 'buttonShadowOffsetX', 0);
    final buttonShadowOffsetY = _getDouble(config, 'buttonShadowOffsetY', 0);

    return Container(
      decoration: buttonShadowColor != null && buttonShadowBlur > 0
          ? BoxDecoration(
              borderRadius: BorderRadius.circular(buttonBorderRadius),
              boxShadow: [
                BoxShadow(
                  color: buttonShadowColor,
                  blurRadius: buttonShadowBlur,
                  spreadRadius: buttonShadowSpread,
                  offset: Offset(buttonShadowOffsetX, buttonShadowOffsetY),
                ),
              ],
            )
          : null,
      child: SizedBox(
        width: buttonWidth is num ? buttonWidth.toDouble() : double.infinity,
        height: buttonHeight,
        child: ElevatedButton(
          onPressed: () => _handleCTA('primary'),
          style: ElevatedButton.styleFrom(
            backgroundColor: buttonColor,
            foregroundColor: buttonTextColor,
            elevation: buttonElevation,
            shadowColor: Colors.transparent,
            padding: EdgeInsets.symmetric(
              vertical: buttonPaddingVertical,
              horizontal: buttonPaddingHorizontal,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(buttonBorderRadius),
              side: buttonBorderColor != null && buttonBorderWidth > 0
                  ? BorderSide(
                      color: buttonBorderColor, width: buttonBorderWidth)
                  : BorderSide.none,
            ),
          ),
          child: Text(
            _applyTextTransform(text, buttonTextTransform),
            style: TextStyle(
              fontSize: buttonFontSize,
              fontWeight: buttonFontWeight,
              letterSpacing: buttonLetterSpacing,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSecondaryButton(Map<String, dynamic> config, String text) {
    final buttonHeight = _getDouble(config, 'secondaryButtonHeight', 50);
    final buttonColor =
        _parseColor(config['secondaryButtonColor']) ?? const Color(0xFFE0E0E0);
    final buttonTextColor =
        _parseColor(config['secondaryButtonTextColor']) ?? Colors.black;
    final buttonFontSize = _getDouble(config, 'secondaryButtonFontSize', 16);
    final buttonFontWeight =
        _parseFontWeight(config['secondaryButtonFontWeight']);
    final buttonBorderRadius =
        _getDouble(config, 'secondaryButtonBorderRadius', 12);
    final buttonElevation = _getDouble(config, 'secondaryButtonElevation', 0);
    final buttonBorderColor = _parseColor(config['secondaryButtonBorderColor']);
    final buttonBorderWidth =
        _getDouble(config, 'secondaryButtonBorderWidth', 1);

    // SECONDARY BUTTON ADVANCED STYLING
    final buttonPaddingVertical =
        _getDouble(config, 'secondaryButtonPaddingVertical', 0);
    final buttonPaddingHorizontal =
        _getDouble(config, 'secondaryButtonPaddingHorizontal', 0);
    final buttonLetterSpacing =
        _getDouble(config, 'secondaryButtonLetterSpacing', 0);
    final buttonWidth = config['secondaryButtonWidth'];
    final buttonTextTransform =
        config['secondaryButtonTextTransform']?.toString();

    // SECONDARY BUTTON SHADOW
    final buttonShadowColor = _parseColor(config['secondaryButtonShadowColor']);
    final buttonShadowBlur = _getDouble(config, 'secondaryButtonShadowBlur', 0);
    final buttonShadowSpread =
        _getDouble(config, 'secondaryButtonShadowSpread', 0);
    final buttonShadowOffsetX =
        _getDouble(config, 'secondaryButtonShadowOffsetX', 0);
    final buttonShadowOffsetY =
        _getDouble(config, 'secondaryButtonShadowOffsetY', 0);

    return Container(
      decoration: buttonShadowColor != null && buttonShadowBlur > 0
          ? BoxDecoration(
              borderRadius: BorderRadius.circular(buttonBorderRadius),
              boxShadow: [
                BoxShadow(
                  color: buttonShadowColor,
                  blurRadius: buttonShadowBlur,
                  spreadRadius: buttonShadowSpread,
                  offset: Offset(buttonShadowOffsetX, buttonShadowOffsetY),
                ),
              ],
            )
          : null,
      child: SizedBox(
        width: buttonWidth is num ? buttonWidth.toDouble() : double.infinity,
        height: buttonHeight,
        child: ElevatedButton(
          onPressed: () => _handleCTA('secondary'),
          style: ElevatedButton.styleFrom(
            backgroundColor: buttonColor,
            foregroundColor: buttonTextColor,
            elevation: buttonElevation,
            shadowColor: Colors.transparent,
            padding: EdgeInsets.symmetric(
              vertical: buttonPaddingVertical,
              horizontal: buttonPaddingHorizontal,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(buttonBorderRadius),
              side: buttonBorderColor != null && buttonBorderWidth > 0
                  ? BorderSide(
                      color: buttonBorderColor, width: buttonBorderWidth)
                  : BorderSide.none,
            ),
          ),
          child: Text(
            _applyTextTransform(text, buttonTextTransform),
            style: TextStyle(
              fontSize: buttonFontSize,
              fontWeight: buttonFontWeight,
              letterSpacing: buttonLetterSpacing,
            ),
          ),
        ),
      ),
    );
  }

  // ========== HELPER METHODS ==========

  int _getInt(Map<String, dynamic> config, String key, int defaultValue) {
    final value = config[key];
    if (value is int) return value;
    if (value is double) return value.toInt();
    if (value is String) return int.tryParse(value) ?? defaultValue;
    return defaultValue;
  }

  double _getDouble(
      Map<String, dynamic> config, String key, double defaultValue) {
    final value = config[key];
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? defaultValue;
    return defaultValue;
  }

  bool _getBool(Map<String, dynamic> config, String key, bool defaultValue) {
    final value = config[key];
    if (value is bool) return value;
    if (value is String) return value.toLowerCase() == 'true';
    return defaultValue;
  }

  Color? _parseColor(dynamic color) {
    if (color == null) return null;
    if (color is Color) return color;

    final colorStr = color.toString();
    if (colorStr.startsWith('#')) {
      final hexColor = colorStr.replaceFirst('#', '');
      final value = int.tryParse('FF$hexColor', radix: 16);
      return value != null ? Color(value) : null;
    }
    return null;
  }

  FontWeight _parseFontWeight(dynamic weight) {
    if (weight == null) return FontWeight.normal;
    if (weight is FontWeight) return weight;

    final weightStr = weight.toString().toLowerCase();
    switch (weightStr) {
      case '100':
      case 'thin':
        return FontWeight.w100;
      case '200':
      case 'extralight':
        return FontWeight.w200;
      case '300':
      case 'light':
        return FontWeight.w300;
      case '400':
      case 'normal':
      case 'regular':
        return FontWeight.w400;
      case '500':
      case 'medium':
        return FontWeight.w500;
      case '600':
      case 'semibold':
        return FontWeight.w600;
      case '700':
      case 'bold':
        return FontWeight.w700;
      case '800':
      case 'extrabold':
        return FontWeight.w800;
      case '900':
      case 'black':
        return FontWeight.w900;
      default:
        return FontWeight.normal;
    }
  }

  TextAlign _parseTextAlign(dynamic align) {
    if (align == null) return TextAlign.start;
    final alignStr = align.toString().toLowerCase();
    switch (alignStr) {
      case 'left':
        return TextAlign.left;
      case 'center':
        return TextAlign.center;
      case 'right':
        return TextAlign.right;
      case 'justify':
        return TextAlign.justify;
      default:
        return TextAlign.start;
    }
  }

  BoxFit _parseBoxFit(dynamic fit) {
    if (fit == null) return BoxFit.cover;
    final fitStr = fit.toString().toLowerCase();
    switch (fitStr) {
      case 'contain':
        return BoxFit.contain;
      case 'cover':
        return BoxFit.cover;
      case 'fill':
        return BoxFit.fill;
      case 'fit':
        return BoxFit.fitWidth;
      default:
        return BoxFit.cover;
    }
  }

  // NEW: Parse gradient from config
  Gradient? _parseGradient(dynamic gradient) {
    if (gradient == null) return null;

    // Handle string gradient (CSS linear-gradient format)
    if (gradient is String) {
      return null; // Skip CSS gradients for now
    }

    // Handle object gradient
    if (gradient is Map) {
      final type = gradient['type']?.toString() ?? 'linear';
      final colors = (gradient['colors'] as List?)
              ?.map((c) => _parseColor(c) ?? Colors.black)
              .toList() ??
          [Colors.black, Colors.white];

      // Parse gradient stops (color positions 0.0-1.0)
      final stops = (gradient['stops'] as List?)
          ?.map((s) => (s as num?)?.toDouble() ?? 0.0)
          .toList();

      if (type == 'linear') {
        final angle = gradient['angle'] as num? ?? 180;
        final alignment = _angleToAlignment(angle.toDouble());
        return LinearGradient(
          begin: alignment.begin,
          end: alignment.end,
          colors: colors,
          stops: stops,
        );
      } else if (type == 'radial') {
        // Radial gradient center and radius
        final centerX = (gradient['centerX'] as num?)?.toDouble() ?? 0.5;
        final centerY = (gradient['centerY'] as num?)?.toDouble() ?? 0.5;
        final radius = (gradient['radius'] as num?)?.toDouble() ?? 0.5;

        return RadialGradient(
          center: Alignment(
              centerX * 2 - 1, centerY * 2 - 1), // Convert 0-1 to -1 to 1
          radius: radius,
          colors: colors,
          stops: stops,
        );
      }
    }
    return null;
  }

  _AlignmentPair _angleToAlignment(double angle) {
    // Convert CSS angle (0=top, 90=right, 180=bottom, 270=left) to Flutter alignment
    final radians = (angle - 90) * math.pi / 180;
    return _AlignmentPair(
      begin: Alignment(
        -math.cos(radians),
        -math.sin(radians),
      ),
      end: Alignment(
        math.cos(radians),
        math.sin(radians),
      ),
    );
  }

  // NEW: Parse background image from config
  DecorationImage? _parseBackgroundImage(
      dynamic bgImage, Map<String, dynamic> config) {
    if (bgImage == null) return null;

    String? imageUrl;
    if (bgImage is String) {
      // Simple extraction - remove url() wrapper and quotes
      imageUrl = bgImage
          .replaceAll('url(', '')
          .replaceAll(')', '')
          .replaceAll('"', '')
          .replaceAll("'", '')
          .trim();
    }

    if (imageUrl == null || imageUrl.isEmpty) return null;

    return DecorationImage(
      image: NetworkImage(imageUrl),
      fit: _parseBoxFit(config['backgroundSize']),
      alignment: _parseAlignment(config['backgroundPosition']),
      repeat: _parseImageRepeat(config['backgroundRepeat']),
    );
  }

  Alignment _parseAlignment(dynamic position) {
    if (position == null) return Alignment.center;
    final posStr = position.toString().toLowerCase();
    if (posStr.contains('top')) {
      if (posStr.contains('left')) return Alignment.topLeft;
      if (posStr.contains('right')) return Alignment.topRight;
      return Alignment.topCenter;
    }
    if (posStr.contains('bottom')) {
      if (posStr.contains('left')) return Alignment.bottomLeft;
      if (posStr.contains('right')) return Alignment.bottomRight;
      return Alignment.bottomCenter;
    }
    if (posStr.contains('left')) return Alignment.centerLeft;
    if (posStr.contains('right')) return Alignment.centerRight;
    return Alignment.center;
  }

  ImageRepeat _parseImageRepeat(dynamic repeat) {
    if (repeat == null) return ImageRepeat.noRepeat;
    final repeatStr = repeat.toString().toLowerCase();
    switch (repeatStr) {
      case 'repeat':
        return ImageRepeat.repeat;
      case 'repeat-x':
        return ImageRepeat.repeatX;
      case 'repeat-y':
        return ImageRepeat.repeatY;
      default:
        return ImageRepeat.noRepeat;
    }
  }

  // NEW: Build close button
  Widget _buildCloseButton(Map<String, dynamic> config) {
    final showCloseButton = _getBool(config, 'showCloseButton', false);
    if (!showCloseButton) return const SizedBox.shrink();

    final closeButtonSize = _getDouble(config, 'closeButtonSize', 24);
    final closeButtonColor =
        _parseColor(config['closeButtonColor']) ?? Colors.grey[600];
    final closeButtonPosition =
        config['closeButtonPosition']?.toString() ?? 'top-right';
    final closeButtonMargin = _getDouble(config, 'closeButtonMargin', 8);

    double? top, right, bottom, left;
    if (closeButtonPosition.contains('top')) {
      top = closeButtonMargin;
    } else if (closeButtonPosition.contains('bottom')) {
      bottom = closeButtonMargin;
    }
    if (closeButtonPosition.contains('right')) {
      right = closeButtonMargin;
    } else if (closeButtonPosition.contains('left')) {
      left = closeButtonMargin;
    }

    return Positioned(
      top: top,
      right: right,
      bottom: bottom,
      left: left,
      child: IconButton(
        icon: Icon(Icons.close, size: closeButtonSize, color: closeButtonColor),
        onPressed: _handleDismiss,
        padding: EdgeInsets.zero,
        constraints: BoxConstraints(
          minWidth: closeButtonSize,
          minHeight: closeButtonSize,
        ),
      ),
    );
  }

  // NEW: Build icon layers
  List<Widget> _buildIcons(Map<String, dynamic> config) {
    final icons = config['icons'];
    if (icons == null || icons is! List) return [];

    return icons.map<Widget>((icon) {
      if (icon is! Map) return const SizedBox.shrink();

      final iconSize = (icon['size'] as num?)?.toDouble() ?? 20;
      final iconColor = _parseColor(icon['color']) ?? Colors.grey[600];
      final iconOpacity = (icon['opacity'] as num?)?.toDouble() ?? 1.0;
      final iconRotation = (icon['rotation'] as num?)?.toDouble() ?? 0;
      final iconName = icon['name']?.toString();
      final position = icon['position'] as Map?;

      if (position == null) return const SizedBox.shrink();

      final x = (position['x'] as num?)?.toDouble() ?? 0;
      final y = (position['y'] as num?)?.toDouble() ?? 0;

      Widget iconWidget = Icon(
        _parseIconData(iconName),
        size: iconSize,
        color: iconColor,
      );

      // Apply rotation if specified
      if (iconRotation != 0) {
        iconWidget = Transform.rotate(
          angle: iconRotation * math.pi / 180, // Convert degrees to radians
          child: iconWidget,
        );
      }

      // Apply opacity if specified
      if (iconOpacity < 1.0) {
        iconWidget = Opacity(
          opacity: iconOpacity,
          child: iconWidget,
        );
      }

      return Positioned(
        left: x,
        top: y,
        child: iconWidget,
      );
    }).toList();
  }

  // NEW: Parse icon name to IconData
  IconData _parseIconData(String? iconName) {
    if (iconName == null) return Icons.star;
    final name = iconName.toLowerCase().replaceAll('_', '').replaceAll('-', '');
    switch (name) {
      case 'star':
        return Icons.star;
      case 'heart':
      case 'favorite':
        return Icons.favorite;
      case 'check':
      case 'checkmark':
        return Icons.check;
      case 'close':
      case 'x':
        return Icons.close;
      case 'info':
      case 'information':
        return Icons.info;
      case 'warning':
      case 'alert':
        return Icons.warning;
      case 'error':
        return Icons.error;
      case 'home':
        return Icons.home;
      case 'settings':
      case 'gear':
        return Icons.settings;
      case 'search':
        return Icons.search;
      case 'notification':
      case 'bell':
        return Icons.notifications;
      case 'user':
      case 'person':
      case 'profile':
        return Icons.person;
      case 'mail':
      case 'email':
        return Icons.mail;
      case 'phone':
      case 'call':
        return Icons.phone;
      case 'cart':
      case 'shoppingcart':
        return Icons.shopping_cart;
      case 'camera':
        return Icons.camera;
      case 'image':
      case 'photo':
        return Icons.image;
      case 'location':
      case 'pin':
      case 'map':
        return Icons.location_on;
      case 'calendar':
      case 'date':
        return Icons.calendar_today;
      case 'clock':
      case 'time':
        return Icons.access_time;
      case 'share':
        return Icons.share;
      case 'download':
        return Icons.download;
      case 'upload':
        return Icons.upload;
      case 'play':
        return Icons.play_arrow;
      case 'pause':
        return Icons.pause;
      case 'menu':
      case 'hamburger':
        return Icons.menu;
      case 'add':
      case 'plus':
        return Icons.add;
      case 'remove':
      case 'minus':
        return Icons.remove;
      case 'edit':
      case 'pencil':
        return Icons.edit;
      case 'delete':
      case 'trash':
        return Icons.delete;
      case 'filter':
        return Icons.filter_list;
      case 'sort':
        return Icons.sort;
      case 'refresh':
      case 'reload':
        return Icons.refresh;
      case 'lock':
        return Icons.lock;
      case 'unlock':
        return Icons.lock_open;
      case 'visibility':
      case 'eye':
      case 'view':
        return Icons.visibility;
      case 'visibilityoff':
      case 'hide':
        return Icons.visibility_off;
      case 'thumbup':
      case 'like':
        return Icons.thumb_up;
      case 'thumbdown':
      case 'dislike':
        return Icons.thumb_down;
      case 'bookmark':
        return Icons.bookmark;
      case 'flag':
        return Icons.flag;
      case 'comment':
      case 'message':
        return Icons.comment;
      default:
        return Icons.star;
    }
  }

  // NEW: Parse text decoration
  TextDecoration? _parseTextDecoration(dynamic decoration) {
    if (decoration == null) return null;
    final decorationStr = decoration.toString().toLowerCase();
    switch (decorationStr) {
      case 'underline':
        return TextDecoration.underline;
      case 'line-through':
      case 'linethrough':
        return TextDecoration.lineThrough;
      case 'overline':
        return TextDecoration.overline;
      case 'none':
      default:
        return TextDecoration.none;
    }
  }

  // NEW: Parse text decoration style
  TextDecorationStyle? _parseTextDecorationStyle(dynamic style) {
    if (style == null) return null;
    final styleStr = style.toString().toLowerCase();
    switch (styleStr) {
      case 'solid':
        return TextDecorationStyle.solid;
      case 'double':
        return TextDecorationStyle.double;
      case 'dotted':
        return TextDecorationStyle.dotted;
      case 'dashed':
        return TextDecorationStyle.dashed;
      case 'wavy':
        return TextDecorationStyle.wavy;
      default:
        return TextDecorationStyle.solid;
    }
  }

  // NEW: Parse font style
  FontStyle? _parseFontStyle(dynamic style) {
    if (style == null) return null;
    final styleStr = style.toString().toLowerCase();
    return styleStr == 'italic' ? FontStyle.italic : FontStyle.normal;
  }

  // NEW: Apply text transform
  String _applyTextTransform(String text, String? transform) {
    if (transform == null) return text;
    switch (transform.toLowerCase()) {
      case 'uppercase':
        return text.toUpperCase();
      case 'lowercase':
        return text.toLowerCase();
      case 'capitalize':
        return text.split(' ').map((word) {
          if (word.isEmpty) return word;
          return word[0].toUpperCase() + word.substring(1).toLowerCase();
        }).join(' ');
      default:
        return text;
    }
  }

  // NEW: Parse animation curve
  Curve _parseAnimationCurve(dynamic curve) {
    if (curve == null) return Curves.easeOutCubic;
    final curveStr = curve.toString().toLowerCase();
    switch (curveStr) {
      case 'easein':
      case 'ease-in':
        return Curves.easeIn;
      case 'easeout':
      case 'ease-out':
        return Curves.easeOut;
      case 'easeinout':
      case 'ease-in-out':
        return Curves.easeInOut;
      case 'linear':
        return Curves.linear;
      case 'bouncein':
      case 'bounce-in':
        return Curves.bounceIn;
      case 'bounceout':
      case 'bounce-out':
        return Curves.bounceOut;
      case 'bounceinout':
      case 'bounce-in-out':
        return Curves.bounceInOut;
      case 'elasticin':
      case 'elastic-in':
        return Curves.elasticIn;
      case 'elasticout':
      case 'elastic-out':
        return Curves.elasticOut;
      case 'elasticinout':
      case 'elastic-in-out':
        return Curves.elasticInOut;
      default:
        return Curves.easeOutCubic;
    }
  }
}

/// Custom painter for dashed/dotted borders
/// Note: Flutter's BoxDecoration doesn't natively support dashed/dotted borders.
/// This is a placeholder implementation. For production, consider using the
/// 'dotted_border' package: https://pub.dev/packages/dotted_border
class DashedBorderPainter extends CustomPainter {
  final Color color;
  final double width;
  final String style; // 'dashed' or 'dotted'
  final double borderRadius;

  DashedBorderPainter({
    required this.color,
    required this.width,
    required this.style,
    this.borderRadius = 0,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = width
      ..style = PaintingStyle.stroke;

    final path = Path();

    if (borderRadius > 0) {
      path.addRRect(RRect.fromRectAndRadius(
        Rect.fromLTWH(0, 0, size.width, size.height),
        Radius.circular(borderRadius),
      ));
    } else {
      path.addRect(Rect.fromLTWH(0, 0, size.width, size.height));
    }

    if (style == 'dashed') {
      // Create dashed effect
      _drawDashedPath(canvas, path, paint, dashLength: 5, gapLength: 3);
    } else if (style == 'dotted') {
      // Create dotted effect
      _drawDashedPath(canvas, path, paint, dashLength: 1, gapLength: 2);
    } else {
      canvas.drawPath(path, paint);
    }
  }

  void _drawDashedPath(Canvas canvas, Path path, Paint paint,
      {required double dashLength, required double gapLength}) {
    final pathMetrics = path.computeMetrics();
    for (final metric in pathMetrics) {
      double distance = 0;
      while (distance < metric.length) {
        final segment = metric.extractPath(
          distance,
          distance + dashLength,
        );
        canvas.drawPath(segment, paint);
        distance += dashLength + gapLength;
      }
    }
  }

  @override
  bool shouldRepaint(DashedBorderPainter oldDelegate) =>
      color != oldDelegate.color ||
      width != oldDelegate.width ||
      style != oldDelegate.style ||
      borderRadius != oldDelegate.borderRadius;
}
