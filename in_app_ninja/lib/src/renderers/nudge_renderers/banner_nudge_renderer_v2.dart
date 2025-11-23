import 'package:flutter/material.dart';
import 'dart:async';
import '../../models/campaign.dart';
import 'bottom_sheet_nudge_renderer_v2.dart' show BottomSheetNudgeRenderer; // Reuse logic if possible, but here we copy for independence

/// BANNER NUDGE RENDERER V2
///
/// FEATURES:
/// ✅ Dynamic "Canva-style" layout system
/// ✅ Top/Bottom positioning
/// ✅ Slide animations
/// ✅ Full component support
class BannerNudgeRenderer extends StatefulWidget {
  final Campaign campaign;
  final VoidCallback? onDismiss;
  final Function(String action, Map<String, dynamic>? data)? onCTAClick;

  const BannerNudgeRenderer({
    Key? key,
    required this.campaign,
    this.onDismiss,
    this.onCTAClick,
  }) : super(key: key);

  @override
  State<BannerNudgeRenderer> createState() => _BannerNudgeRendererState();
}

class _BannerNudgeRendererState extends State<BannerNudgeRenderer>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();

    final config = widget.campaign.config;
    final duration = config['animationDuration'] as int? ?? 300;
    final position = config['position'] as String? ?? 'top';

    _controller = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: duration),
    );

    final begin = position == 'bottom' ? const Offset(0, 1) : const Offset(0, -1);
    _slideAnimation = Tween<Offset>(
      begin: begin,
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOut,
    ));

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

  void _handleCTA(String action, Map<String, dynamic>? data) {
    widget.onCTAClick?.call(action, data);
    if (widget.campaign.config['autoDismissOnCTA'] != false) {
      _handleDismiss();
    }
  }

  @override
  Widget build(BuildContext context) {
    final config = widget.campaign.config;
    final position = config['position'] as String? ?? 'top';
    final height = (config['height'] as num?)?.toDouble() ?? 80.0;
    final backgroundColor = _parseColor(config['backgroundColor']) ?? Colors.blue;
    final dismissible = config['dismissible'] != false;

    final banner = SlideTransition(
      position: _slideAnimation,
      child: Material(
        elevation: 4,
        color: backgroundColor,
        child: Container(
          height: height,
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Stack(
            children: [
              // Content
              _buildContent(config),

              // Close Button
              if (dismissible)
                Positioned(
                  right: 0,
                  top: 0,
                  bottom: 0,
                  child: Center(
                    child: IconButton(
                      icon: const Icon(Icons.close, color: Colors.white70, size: 20),
                      onPressed: _handleDismiss,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );

    return Positioned(
      left: 0,
      right: 0,
      top: position == 'top' ? 0 : null,
      bottom: position == 'bottom' ? 0 : null,
      child: SafeArea(
        bottom: position == 'bottom',
        top: position == 'top',
        child: banner,
      ),
    );
  }

  Widget _buildContent(Map<String, dynamic> config) {
    // Flexible Layout System
    if (config['components'] != null && config['components'] is List) {
      return _buildFlexibleLayout(config);
    }
    return const Center(child: Text('Legacy banner not supported in V2', style: TextStyle(color: Colors.white)));
  }

  Widget _buildFlexibleLayout(Map<String, dynamic> config) {
    final components = config['components'] as List;
    // Banners are typically Row-based flex layouts
    return Row(
      children: components.map((c) => Expanded(child: _buildComponent(c as Map<String, dynamic>))).toList(),
    );
  }

  Widget _buildComponent(Map<String, dynamic> component) {
    final type = component['type'] as String;
    final style = component['style'] as Map<String, dynamic>? ?? {};

    Widget child;
    switch (type) {
      case 'text':
        child = Text(
          component['content']?['text'] ?? '',
          style: TextStyle(color: _parseColor(style['color']) ?? Colors.white),
        );
        break;
      case 'button':
        child = ElevatedButton(
          onPressed: () => _handleCTA('click', component),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.white,
            foregroundColor: Colors.blue,
          ),
          child: Text(component['content']?['text'] ?? 'Button'),
        );
        break;
      case 'image':
         child = Image.network(component['content']?['url'] ?? '', height: 40);
         break;
      default:
        child = const SizedBox.shrink();
    }
    return Container(
      padding: const EdgeInsets.all(8),
      child: child,
    );
  }

  Color? _parseColor(dynamic color) {
    if (color == null) return null;
    if (color is Color) return color;
    final colorStr = color.toString();
    if (colorStr.startsWith('#')) {
      final hexColor = colorStr.replaceFirst('#', '');
      if (hexColor.length == 6) {
        return Color(int.parse('FF$hexColor', radix: 16));
      }
    }
    return null;
  }
}
