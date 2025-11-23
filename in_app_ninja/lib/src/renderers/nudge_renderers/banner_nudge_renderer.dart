import 'package:flutter/material.dart';
import 'dart:async';
import '../../models/campaign.dart';

/// Banner Nudge Renderer
///
/// Renders a slide-in banner at top or bottom with:
/// - Slide-in/out animations
/// - Auto-dismiss timer
/// - Swipe to dismiss gesture
/// - Position: top or bottom
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
  Timer? _autoDismissTimer;
  double _dragDistance = 0;

  @override
  void initState() {
    super.initState();

    final config = widget.campaign.config;
    final position = config['position']?.toString() ?? 'top';

    // Entry animation
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );

    // Slide from top or bottom
    final begin = position == 'bottom'
        ? const Offset(0, 1) // Slide from bottom
        : const Offset(0, -1); // Slide from top

    _slideAnimation = Tween<Offset>(
      begin: begin,
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutCubic,
    ));

    _controller.forward();

    // Auto-dismiss timer
    final autoDismissSeconds = config['autoDismissSeconds'] as int? ?? 5;
    if (autoDismissSeconds > 0) {
      _autoDismissTimer = Timer(
        Duration(seconds: autoDismissSeconds),
        _handleDismiss,
      );
    }
  }

  @override
  void dispose() {
    _autoDismissTimer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  Future<void> _handleDismiss() async {
    _autoDismissTimer?.cancel();
    await _controller.reverse();
    widget.onDismiss?.call();
  }

  void _handleCTA(String action) {
    final config = widget.campaign.config;
    widget.onCTAClick?.call(action, config);
    _handleDismiss();
  }

  void _handleVerticalDrag(DragUpdateDetails details) {
    final config = widget.campaign.config;
    final position = config['position']?.toString() ?? 'top';

    setState(() {
      _dragDistance += details.delta.dy;

      // Only allow dragging in dismiss direction
      if (position == 'top' && _dragDistance > 0) {
        _dragDistance = 0; // Can't drag down when at top
      } else if (position == 'bottom' && _dragDistance < 0) {
        _dragDistance = 0; // Can't drag up when at bottom
      }

      // Convert drag to animation value (0 to -1 for top, 0 to 1 for bottom)
      final threshold = 100.0;
      final dragRatio = (_dragDistance.abs() / threshold).clamp(0.0, 1.0);
      _controller.value = 1.0 - dragRatio;
    });
  }

  void _handleVerticalDragEnd(DragEndDetails details) {
    final config = widget.campaign.config;
    final position = config['position']?.toString() ?? 'top';
    final threshold = 80.0;

    if (_dragDistance.abs() > threshold) {
      // Dismiss if dragged far enough
      _handleDismiss();
    } else {
      // Snap back
      setState(() {
        _dragDistance = 0;
      });
      _controller.forward();
    }
  }

  @override
  Widget build(BuildContext context) {
    final config = widget.campaign.config;
    final position = config['position']?.toString() ?? 'top';
    final text = config['text']?.toString() ?? 'New notification';
    final backgroundColor =
        _parseColor(config['backgroundColor']) ?? const Color(0xFF1E40AF);
    final textColor = _parseColor(config['textColor']) ?? Colors.white;
    final showCloseButton = config['showCloseButton'] != false;
    final hasImage = config['imageUrl'] != null;
    final hasButton = config['buttonText'] != null;

    return Align(
      alignment:
          position == 'bottom' ? Alignment.bottomCenter : Alignment.topCenter,
      child: SlideTransition(
        position: _slideAnimation,
        child: GestureDetector(
          onVerticalDragUpdate: _handleVerticalDrag,
          onVerticalDragEnd: _handleVerticalDragEnd,
          child: Material(
            color: Colors.transparent,
            child: Container(
              width: double.infinity,
              margin: EdgeInsets.only(
                top: position == 'top' ? MediaQuery.of(context).padding.top : 0,
                bottom: position == 'bottom'
                    ? MediaQuery.of(context).padding.bottom
                    : 0,
              ),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: backgroundColor,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.15),
                    blurRadius: 12,
                    offset: Offset(0, position == 'bottom' ? -4 : 4),
                  ),
                ],
              ),
              child: SafeArea(
                top: position == 'top',
                bottom: position == 'bottom',
                child: Row(
                  children: [
                    // Icon/Image
                    if (hasImage)
                      Padding(
                        padding: const EdgeInsets.only(right: 12),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.network(
                            config['imageUrl'],
                            width: 48,
                            height: 48,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Icon(
                              Icons.notifications,
                              color: textColor,
                              size: 32,
                            ),
                          ),
                        ),
                      )
                    else
                      Padding(
                        padding: const EdgeInsets.only(right: 12),
                        child: Icon(
                          Icons.notifications,
                          color: textColor,
                          size: 32,
                        ),
                      ),

                    // Content
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          // Title (optional)
                          if (config['title'] != null)
                            Padding(
                              padding: const EdgeInsets.only(bottom: 4),
                              child: Text(
                                config['title'],
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: textColor,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),

                          // Message
                          Text(
                            text,
                            style: TextStyle(
                              fontSize: 14,
                              color: textColor.withOpacity(0.9),
                              height: 1.4,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(width: 12),

                    // CTA Button (optional)
                    if (hasButton)
                      Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ElevatedButton(
                          onPressed: () => _handleCTA('primary'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: textColor,
                            foregroundColor: backgroundColor,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(6),
                            ),
                            elevation: 0,
                          ),
                          child: Text(
                            config['buttonText'],
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),

                    // Close button
                    if (showCloseButton)
                      IconButton(
                        icon: Icon(Icons.close, color: textColor, size: 20),
                        onPressed: _handleDismiss,
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(
                          minWidth: 32,
                          minHeight: 32,
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
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
}
