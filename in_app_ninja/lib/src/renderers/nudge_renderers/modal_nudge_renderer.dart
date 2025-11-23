import 'package:flutter/material.dart';
import '../../models/campaign.dart';

/// Modal Nudge Renderer
/// 
/// Renders a centered modal dialog with:
/// - Backdrop dimming
/// - Entry/exit animations
/// - Close button
/// - CTA buttons
/// - Dismissible by tapping backdrop
class ModalNudgeRenderer extends StatefulWidget {
  final Campaign campaign;
  final VoidCallback? onDismiss;
  final Function(String action, Map<String, dynamic>? data)? onCTAClick;

  const ModalNudgeRenderer({
    Key? key,
    required this.campaign,
    this.onDismiss,
    this.onCTAClick,
  }) : super(key: key);

  @override
  State<ModalNudgeRenderer> createState() => _ModalNudgeRendererState();
}

class _ModalNudgeRendererState extends State<ModalNudgeRenderer>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    
    // Entry animation
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );

    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutBack),
    );

    _opacityAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
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
    final config = widget.campaign.config;
    widget.onCTAClick?.call(action, config);
    _handleDismiss();
  }

  @override
  Widget build(BuildContext context) {
    final config = widget.campaign.config;
    final text = config['text']?.toString() ?? 'Hello!';
    final buttonText = config['buttonText']?.toString() ?? 'Got it';
    final backgroundColor = _parseColor(config['backgroundColor']) ?? Colors.white;
    final textColor = _parseColor(config['textColor']) ?? Colors.black;
    final showCloseButton = config['showCloseButton'] != false;
    final dismissible = config['dismissible'] != false;

    return WillPopScope(
      onWillPop: () async {
        if (dismissible) {
          await _handleDismiss();
          return false;
        }
        return false;
      },
      child: Material(
        color: Colors.black54, // Backdrop
        child: GestureDetector(
          onTap: dismissible ? _handleDismiss : null,
          behavior: HitTestBehavior.opaque,
          child: Center(
            child: GestureDetector(
              onTap: () {}, // Prevent dismiss when tapping modal content
              child: FadeTransition(
                opacity: _opacityAnimation,
                child: ScaleTransition(
                  scale: _scaleAnimation,
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 24),
                    constraints: const BoxConstraints(maxWidth: 400),
                    decoration: BoxDecoration(
                      color: backgroundColor,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.2),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Close button
                        if (showCloseButton)
                          Align(
                            alignment: Alignment.topRight,
                            child: IconButton(
                              icon: Icon(Icons.close, color: textColor.withOpacity(0.6)),
                              onPressed: _handleDismiss,
                              padding: const EdgeInsets.all(8),
                            ),
                          ),
                        
                        // Content
                        Padding(
                          padding: EdgeInsets.fromLTRB(
                            24,
                            showCloseButton ? 0 : 24,
                            24,
                            24,
                          ),
                          child: Column(
                            children: [
                              // Image (if provided)
                              if (config['imageUrl'] != null)
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 16),
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(8),
                                    child: Image.network(
                                      config['imageUrl'],
                                      height: 120,
                                      width: double.infinity,
                                      fit: BoxFit.cover,
                                      errorBuilder: (_, __, ___) => const SizedBox(),
                                    ),
                                  ),
                                ),

                              // Title (if provided)
                              if (config['title'] != null)
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 12),
                                  child: Text(
                                    config['title'],
                                    style: TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                      color: textColor,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                ),

                              // Message text
                              Text(
                                text,
                                style: TextStyle(
                                  fontSize: 16,
                                  color: textColor.withOpacity(0.8),
                                  height: 1.5,
                                ),
                                textAlign: TextAlign.center,
                              ),

                              const SizedBox(height: 24),

                              // CTA Buttons
                              _buildCTAButtons(config, textColor),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCTAButtons(Map<String, dynamic> config, Color textColor) {
    final buttonText = config['buttonText']?.toString() ?? 'Got it';
    final secondaryButtonText = config['secondaryButtonText']?.toString();
    final buttonColor = _parseColor(config['buttonColor']) ?? 
                       _parseColor(config['backgroundColor']) ?? 
                       Theme.of(context).primaryColor;

    return Column(
      children: [
        // Primary CTA
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => _handleCTA('primary'),
            style: ElevatedButton.styleFrom(
              backgroundColor: buttonColor,
              foregroundColor: _getContrastColor(buttonColor),
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              elevation: 0,
            ),
            child: Text(
              buttonText,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),

        // Secondary CTA (optional)
        if (secondaryButtonText != null) ...[
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: TextButton(
              onPressed: () => _handleCTA('secondary'),
              style: TextButton.styleFrom(
                foregroundColor: textColor.withOpacity(0.6),
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
              child: Text(
                secondaryButtonText,
                style: const TextStyle(fontSize: 14),
              ),
            ),
          ),
        ],
      ],
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

  Color _getContrastColor(Color background) {
    // Calculate luminance to determine if text should be black or white
    final luminance = background.computeLuminance();
    return luminance > 0.5 ? Colors.black : Colors.white;
  }
}
