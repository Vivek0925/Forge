import React, { useEffect } from 'react';

type ModalProps = {
	open: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
};

export default function Modal({ open, onClose, title, children }: ModalProps) {
	useEffect(() => {
		if (!open) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose();
		};

		document.addEventListener('keydown', handleKeyDown);
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.body.style.overflow = previousOverflow;
		};
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<button
				type="button"
				aria-label="Close modal"
				className="absolute inset-0 bg-black/50"
				onClick={onClose}
			/>

			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby={title ? 'modal-title' : undefined}
				className="relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
			>
				{title ? (
					<h2 id="modal-title" className="mb-4 text-lg font-semibold text-slate-900">
						{title}
					</h2>
				) : null}
				{children}
			</div>
		</div>
	);
}
